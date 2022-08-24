import { ForbiddenException, Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { GameChannel } from 'src/entities/game.channel.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { GameUsedImages } from 'src/entities/game.used-images.entity';
import { Users } from 'src/entities/users.entity';
import { GameService } from 'src/game/game.service';
import { MateService } from 'src/mate/mate.service';
import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { TaskService } from 'src/task/task.service';
import { DataSource, Not, Repository } from 'typeorm';
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
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        private dataSource: DataSource,
        private readonly pushNotiService: PushNotificationService,
        private readonly schedulerRegistry: SchedulerRegistry
    ) {}

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
            
            newAlarm = await queryRunner.manager.getRepository(Alarms).save({
                Host_id: myId,
                member_count: 1,
                ...body
            });

            await queryRunner.manager.getRepository(AlarmMembers).save({
                Alarm_id: newAlarm.id,
                User_id: myId
            });

            const newChannel = await queryRunner.manager.getRepository(GameChannel).save({
                name: String(newAlarm.id),
                Alarm_id: newAlarm.id,
                player_count: 0,
            });
            const { randomKeywordId, selectedGPIs: images1, keyword: keyword1 } = await this.gameService.getImagesForGame(myId, body.Game_id);
            const { selectedGPIs: images2, keyword: keyword2 } = await this.gameService.getImagesForGame(myId, body.Game_id, randomKeywordId);
            
            for await (let img of images1) {
                await queryRunner.manager.getRepository(GameUsedImages).save({
                    Game_channel_id: newChannel.id,
                    keyword: keyword1,
                    Game_play_image_id: img.id
                });
            }
            for await (let img of images2) {
                await queryRunner.manager.getRepository(GameUsedImages).save({
                    Game_channel_id: newChannel.id,
                    keyword: keyword2,
                    Game_play_image_id: img.id
                });
            }

            
            await queryRunner.manager.getRepository(Alarms).createQueryBuilder()
                        .update()
                        .set({ Game_channel_id: newChannel.id })
                        .where('id = :id', { id: newAlarm.id })
                        .execute();


            await queryRunner.commitTransaction();
            // push alarm
            // random image select?
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new ForbiddenException(e);

        } finally {
            await queryRunner.release();
        }
        if (!newAlarm) {
            return null;
        }
        return newAlarm.id;
    }

    async editAlarm(myId: number, alarmId: number, condition: QueryDeepPartialEntity<Alarms>) {
        const alarm = await this.getAlarmById(alarmId);
        if (myId !== alarm.Host_id) {
            throw new ForbiddenException();
        }
        await this.alarmsRepository.createQueryBuilder()
            .update(Alarms)
            .set(condition)
            .where('id = :id', { id: alarm.id })
            .execute();
            
        return 'OK';
    }

    // private 이면
        // host가 나랑 mate인지 확인
    // 내가 들어갈 수 있는 인원인지 확인
    // 알람 멤버에 나 추가
    // 알람 멤버 수 업데이트
    async joinAlarm(me: Users, alarmId: number) {

        const alarm = await this.getAlarmById(alarmId);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (alarm.is_private) {
                const validMate = await this.mateService.validateMate(me.id, alarm.Host_id);
                if (!validMate) {
                    throw new ForbiddenException();
                }
            }
            if (alarm.member_count >= alarm.max_members) {
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

            const anotherMemberProfile = await this.alarmMembersRepository.createQueryBuilder('m')
                .select([
                    'm.created_at',
                    'u.id',
                    'u.device_token',
                    'u.nickname',
                    'u.thumbnail_image_url'
                ])
                .innerJoin('m.User', 'u')
                .where('Alarm_id = :alarmId', { alarmId })
                .andWhere('User_id != :myId', { myId: me.id })
                .getOne();

            const antoherMemberDataForMe = {
                alarmId: alarm.id,
                id: anotherMemberProfile.User.id,
                nickname: anotherMemberProfile.User.nickname,
                thumbnail_url: anotherMemberProfile.User.thumbnail_image_url,
                userType: 'A'
            }

            const myDataForAntoherMember = {
                alarmId: alarm.id,
                id: me.id,
                nickname: me.nickname,
                thumbnail_url: me.thumbnail_image_url,
                userType: 'B'
            }

            const [ hour, minute ] = alarm.time.split(':').map(t => Number(t));
            const date = new Date().getDate();
            const month = new Date().getMonth();
            const year = new Date().getFullYear();
            
            const reservedTime = new Date(year, month, hour >= 9 ? date : date + 1, hour - 9, minute, 0);
            const job = new CronJob(reservedTime, async () => {
                await this.pushNotiService.sendPush(
                    antoherMemberDataForMe.id,
                    anotherMemberProfile.User.device_token,
                    'Alarm',
                    'Alarm ring ring',
                    {
                        type: 'ALARM_START',
                        message: JSON.stringify(myDataForAntoherMember)
                    }
                );
                await this.pushNotiService.sendPush(
                    me.id,
                    me.device_token,
                    'Alarm',
                    'Alarm ring ring',
                    {
                        type: 'ALARM_START',
                        message: JSON.stringify(antoherMemberDataForMe)
                    }
                );
            });
            this.schedulerRegistry.addCronJob(`alarm-${alarm.id}`, job);
            job.start();
            await queryRunner.commitTransaction();
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new ForbiddenException(e);
        } finally {
            await queryRunner.release();
        }

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
                            'alarms.max_members',
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

    private async getAlarmById(alarmId: number) {
        return await this.alarmsRepository.findOneOrFail({ where: { id: alarmId }})
                            .catch(_ => { throw new ForbiddenException() });
    }

}
