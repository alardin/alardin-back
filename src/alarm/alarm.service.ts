import { BadRequestException, CACHE_MANAGER, ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { CronJob } from 'cron';
import { Model } from 'mongoose';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { GameChannel } from 'src/entities/game.channel.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { GameUsedImages } from 'src/entities/game.used-images.entity';
import { Games } from 'src/entities/games.entity';
import { Mates } from 'src/entities/mates.entity';
import { Users } from 'src/entities/users.entity';
import { GameService } from 'src/game/game.service';
import { MateService } from 'src/mate/mate.service';
import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { GameData, GameDataDocument } from 'src/schemas/gameData.schemas';
import { DataSource, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CreateAlarmDto } from './dto/create-alarm.dto';

@Injectable()
export class AlarmService {
    constructor(
        private readonly mateService: MateService,
        private readonly gameService: GameService,
        @InjectRepository(Alarms)
        private readonly alarmsRepository: Repository<Alarms>,
        @InjectRepository(AlarmMembers)
        private readonly alarmMembersRepository: Repository<AlarmMembers>,
        @InjectRepository(GamePurchaseRecords)
        private readonly gamePurRepository: Repository<GamePurchaseRecords>,
        @InjectRepository(Games)
        private readonly gamesRepository: Repository<Games>,
        @InjectRepository(Mates)
        private readonly matesRepository: Repository<Mates>,
        private dataSource: DataSource,
        private readonly pushNotiService: PushNotificationService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly schedulerRegistry: SchedulerRegistry,
        @InjectModel(GameData.name) private gameDataModel: Model<GameDataDocument>
    ) {
        
    }

    async createNewAlarm(myId: number, body: CreateAlarmDto) {
        let newAlarm: Alarms;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const isOwned = await this.gamePurRepository.createQueryBuilder('gpr')
                                .innerJoin('gpr.Game', 'g', 'g.id = :gameId', { gameId: body.Game_id })
                                .innerJoin('gpr.User', 'u', 'u.id = :myId', { myId })
                                .getOne();
            if(!isOwned) {
                throw new ForbiddenException('Users can not play this game');
            }
            const game = await this.gamesRepository.findOneOrFail({
                where: {
                    id: body.Game_id
                }
            }).catch(e => { throw new ForbiddenException(); });
            if (body.max_member > game.max_player) {
                throw new ForbiddenException('Invalid member count');
            }
            newAlarm = await queryRunner.manager.getRepository(Alarms).save({
                Host_id: myId,
                member_count: 1,
                min_player: game.min_player,
                ...body
            });

            await queryRunner.manager.getRepository(AlarmMembers).save({
                Alarm_id: newAlarm.id,
                User_id: myId
            });

            const newChannel = await queryRunner.manager.getRepository(GameChannel).save({
                id: newAlarm.id,
                name: String(newAlarm.id),
                Alarm_id: newAlarm.id,
                player_count: 0,
            });
            // Not keyword, image
            // Data1, Data2
            // const { randomKeywordId, selectedGPIs: images1, keyword: keyword1 } = await this.gameService.getImagesForGame(myId, body.Game_id);
            // const { selectedGPIs: images2, keyword: keyword2 } = await this.gameService.getImagesForGame(myId, body.Game_id, randomKeywordId);
            
            // for await (let img of images1) {
            //     await queryRunner.manager.getRepository(GameUsedImages).save({
            //         Game_channel_id: newChannel.id,
            //         keyword: keyword1,
            //         Game_play_image_id: img.id
            //     });
            // }
            // for await (let img of images2) {
            //     await queryRunner.manager.getRepository(GameUsedImages).save({
            //         Game_channel_id: newChannel.id,
            //         keyword: keyword2,
            //         Game_play_image_id: img.id
            //     });
            // }

            await queryRunner.manager.getRepository(Alarms).createQueryBuilder()
                        .update()
                        .set({ Game_channel_id: newChannel.id })
                        .where('id = :id', { id: newAlarm.id })
                        .execute();
            // const [ hour, minute ] = newAlarm.time.split(':').map(t => Number(t));
            // const date = new Date().getDate();
            // const month = new Date().getMonth();
            // const year = new Date().getFullYear();
            
            // const Before30secondsThanAlarm = new Date(year, month, hour >= 9 ? date : date + 1, process.env.NODE_ENV == 'dev' ? hour : hour - 9, minute, -30);
            // const job = new CronJob(Before30secondsThanAlarm, async () => {
            //     const alarmMemberIds = await this.alarmMembersRepository.find({
            //         where: { Alarm_id: newAlarm.id },
            //         select: {
            //             User_id: true
            //         }
            //     });
            //     const userIds = alarmMemberIds.map(m => m.User_id);
            //     let gameDataForAlarm;
            //     switch(newAlarm.Game_id) {
            //         case 1:
            //             gameDataForAlarm = await this.gameService.readyForGame(newAlarm.id, userIds);
            //             break
            //         case 2:
            //             gameDataForAlarm = await this.gameService.readyForGame(newAlarm.id, userIds, body.data);
            //             break
            //         default:
            //             throw new BadRequestException('Invalid Game_id')
            //             break
            //     }

            //     await this.cacheManager.set(`alarm-${newAlarm.id}-game-data`, gameDataForAlarm, { ttl: 60 * 10 });
                
            // });
            // this.schedulerRegistry.addCronJob(`alarm-${newAlarm.id}-game-data`, job);
            // job.start();
            await queryRunner.commitTransaction();
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new ForbiddenException(e);

        } finally {
            await queryRunner.release();
        }
        if (!newAlarm) {
            return null;
        }
        await this.clearAlarmsCache(myId);
        return newAlarm.id;
    }

    async editAlarm(me: Users, alarmId: number, condition: QueryDeepPartialEntity<Alarms>) {
        const alarm = await this.getAlarmById(alarmId);
        if (me.id !== alarm.Host_id) {
            throw new ForbiddenException();
        }
        await this.alarmsRepository.createQueryBuilder()
            .update(Alarms)
            .set(condition)
            .where('id = :id', { id: alarm.id })
            .execute();
        
        await this.sendMessageToAlarmByHost(me.id, 
            alarm.id, 
            `${me.nickname}님께서 ${alarm.time} 알람방을 수정했습니다.`,
            `${alarm.time} 알람 수정 발생`,
            {
                type: "ROOM_ALARM",
                message: JSON.stringify({
                        type: 'room',
                        content: `${me.nickname}님께서 ${alarm.time} 알람방을 수정했습니다.`,
                        date: new Date(Date.now()).toISOString(),
                }),
            }
        );
        return 'OK';
    }

    // private 이면
        // host가 나랑 mate인지 확인
    // 내가 들어갈 수 있는 인원인지 확인
    // 알람 멤버에 나 추가
    // 알람 멤버 수 업데이트
    
    async joinAlarm(me: Users, alarmId: number) {
        const alarm = await this.getAlarmById(alarmId);
        const alarmMembers = await this.alarmMembersRepository.find({
            where: { Alarm_id: alarm.id },
            select: {
                User_id: true,
                User: {
                    device_token: true
                }
            },
            relations: {
                User: true
            }
        });
        const memberIdsExceptMe = alarmMembers.filter(m => m.User_id != me.id).map(m => m.User_id);
        const queryRunner = this.dataSource.createQueryRunner();
        let validFlag = false;
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (alarm.is_private) {
                // member list 중 한명이라도 mate이면 valid
                const validMate = await this.mateService.validateMate(me.id, alarm.Host_id);
                if (!validMate) {
                    throw new ForbiddenException();
                }
            } else {
                for await (let uId of memberIdsExceptMe) {
                    const isValid = await this.mateService.validateMate(me.id, uId);
                    if (isValid) {
                        validFlag = true;
                        break;
                    } 
                }
            }
            if (!validFlag) {
                throw new ForbiddenException('Not Allowed to join');
            } 
            
            if (alarm.member_count >= alarm.max_member) {
                throw new ForbiddenException();
            }
            const alarmMembers = new AlarmMembers();
            alarmMembers.User_id = me.id;
            alarmMembers.Alarm_id = alarmId;
            
            await this.alarmMembersRepository.save(alarmMembers);
            await this.alarmsRepository.createQueryBuilder('alarms')
                .update(Alarms)
                .set({ member_count: () => 'member_count + 1' })
                .where('id = :id', { id: alarm.id })
                .execute();
            await queryRunner.commitTransaction();
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new ForbiddenException(e);
        } finally {
            await queryRunner.release();
            
        }

        await this.sendMessageToAlarmByMember(me.id, alarm.id, 
            `${me.nickname}님께서 ${alarm.time} 알람방에 참가하였습니다.`,
            `${me.nickname}님의 알람방 참가`,
            {
                type: "ROOM_ALARM",
                message: JSON.stringify({
                        type: 'room',
                        content: `${me.nickname}님께서 ${alarm.time} 알람방에 참가하였습니다.`,
                        date: new Date(Date.now()).toISOString(),
                }),
            }
        );

        await this.clearAlarmsCache(me.id);
        // await this.deleteMembersCache(me.id, alarm.id);
        return 'OK';
        
    }

    async sendMessageToAlarmByHost(myId: number, alarmId: number, title: string, body: string, data?: { [key:string]: string }) {
        const { Members: members } = await this.alarmsRepository.findOne({
            where: {
                id: alarmId,
                Host_id: myId
            },
            select: {
                id: true,
                Host_id: true,
                Game_id: true,
                Members: {
                    id: true,
                    device_token: true
                }
            },
            relations: {
                Members: true
            }
        });
        if (!members) {
            throw new ForbiddenException();
        }
        const membersDeviceTokens = members.filter((m) => m.id !== myId).map(m => m.device_token);
        membersDeviceTokens.length != 0 && (await this.pushNotiService.sendMulticast(membersDeviceTokens, title, body, data));
        return 'OK';    
        
    }

    async sendMessageToAlarmByMember(myId: number, alarmId: number, title: string, body: string, data?: { [key:string]: string }) {
        const alarmMembers = await this.alarmMembersRepository.find({
            where: { Alarm_id: alarmId },
            select: {
                User_id: true,
                User: {
                    device_token: true
                }
            },
            relations: {
                User: true
            }
        });
        const memberIds = alarmMembers.map(m => m.User_id);
        if(!memberIds.includes(myId)) {
            throw new ForbiddenException('Not allowed to send message');
        }
        const memberDTokens = alarmMembers.filter(m => m.User_id != myId).map(m => m.User.device_token);

        memberDTokens.length != 0 && (await this.pushNotiService.sendMulticast(memberDTokens, title, body, data));
        return 'OK'; 
    }

    // alarm 조회할 권한
    async getAlarm(myId: number, alarmId: number) {
        const alarm = await this.getAlarmById(alarmId);
        if (alarm.is_private) {
            const validMate = await this.mateService.validateMate(myId, alarm.Host_id);
            if (!validMate) {
                throw new ForbiddenException();
            }
        }

        const returnedAlarm = await this.alarmsRepository.createQueryBuilder('alarms')
                        .innerJoinAndSelect('alarms.Host', 'h', 'h.id = :hostId', { hostId: alarm.Host_id })
                        .innerJoin('alarms.Members', 'members')
                        .innerJoin('alarms.Game', 'game')
                        .select([
                            'alarms.id',
                            'alarms.name',
                            'alarms.time',
                            'alarms.is_repeated',
                            'alarms.is_private',
                            'alarms.music_name',
                            'alarms.max_member',
                            'alarms.created_at', 
                            'game.id', 
                            'game.name',
                            'game.thumbnail_url',
                            'members.id', 
                            'members.nickname',
                            'members.thumbnail_image_url'
                        ])
                        .getOne();
        return returnedAlarm;
        
    }

    async deleteAlarm(me: Users, alarmId: number) {
        await this.validateAlarmHost(me.id, alarmId);
        const alarm = await this.alarmsRepository.findOneOrFail({ where: { id: alarmId }})
                            .catch(e => { throw new BadRequestException() });
        try {
            await this.alarmsRepository.createQueryBuilder()
                .softDelete()
                .from(Alarms)
                .where('id = :id', { id: alarm.id })
                .execute();
            // await this.clearAlarmsCache(myId);
            // await this.deleteMembersCache(myId, alarmId);
        } catch(e) {
            throw new ForbiddenException('Invalid request');
        }
        await this.sendMessageToAlarmByHost(me.id, alarm.id, 
            `${me.nickname}님께서 ${alarm.time} 알람방을 삭제했습니다.`, 
            `방장이 ${alarm.time} 알람을 삭제했습니다`, 
            {
                type: "ROOM_ALARM",
                message: JSON.stringify({
                        type: 'room',
                        content: `${me.nickname}님께서 ${alarm.time} 알람방을 삭제했습니다.`,
                        date: new Date(Date.now()).toISOString(),
                }),
            }
        );
        return "OK";
    }

    private async getAlarmById(alarmId: number) {
        return await this.alarmsRepository.findOneOrFail({ where: { id: alarmId }})
                            .catch(_ => { throw new ForbiddenException() });
    }

    private async validateAlarmHost(myId: number, alarmId: number) {
        await this.alarmsRepository.findOneOrFail({
            where: {
                Host_id: myId,
                id: alarmId
            }
        }).catch(_ => { throw new ForbiddenException(); });
    }

    async deleteMatesCache(myId: number) {
        const mateIds = await this.mateService.getMateIds(myId);
        mateIds.map(async (mId) => await this.cacheManager.del(`${mId}_mates_alarm_list`));
    }

    async deleteMembersCache(myId: number, alarmId: number) {
        const { Members: members } = await this.alarmsRepository.findOne({
            where: {
                id: alarmId
            },
            select: {
                Members: {
                    id: true,
                }
            },
            relations: {
                Members: true
            }
        });
        if (!members) {
            throw new ForbiddenException();
        }
        const memberIds = members.map(m => m.id);
        memberIds.map(async (mId) => { 
            if (mId != myId) {
                await this.clearAlarmsCache(mId);
            }
        });
    }
    async clearAlarmsCache(myId: number) {
        await this.cacheManager.del(`${myId}_hosted_alarms`);
        await this.cacheManager.del(`${myId}_joined_alarms`);
        await this.deleteMatesCache(myId);
    }
}
