import { CACHE_MANAGER, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessAndRefreshToken } from 'src/auth/auth';
import { AuthService } from 'src/auth/auth.service';
import { AlarmPlayRecords } from 'src/entities/alarm.play.records.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { Assets } from 'src/entities/assets.entity';
import { Users } from 'src/entities/users.entity';
import { KakaoAccountUsed } from 'src/external/kakao/kakao.types';
import { KakaoService } from 'src/external/kakao/kakao.service';
import { DataSource, In, Not, Repository } from 'typeorm';
import { AuthDto } from './dto/auth.dto';
import { EditProfileDto } from './dto/edit-profile.dto';
import { OthersProfileDto } from './dto/others.profile.dto';
import * as bcrypt from 'bcryptjs';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { InvalidTokenException } from 'src/common/exceptions/invalid-token.exception';
import { AlarmResults } from 'src/entities/alarm.results.entity';
import { Mates } from 'src/entities/mates.entity';
import { Cache } from 'cache-manager';

type MatePlayHistory = {
    id: number;
    nickname: string;
    thumbnail_image_url: string;
    playCount: number;
    successCount: number;
    failCount: number;
    mateDue: number;
}

@Injectable()
export class UsersService {
    constructor(
        private readonly kakaoService: KakaoService,
        private readonly authService: AuthService,
        private dataSource: DataSource,
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(Alarms)
        private readonly alarmsRepository: Repository<Alarms>,
        @InjectRepository(AlarmPlayRecords)
        private readonly alarmPlayRecordsRepository: Repository<AlarmPlayRecords>,
        @InjectRepository(AlarmResults)
        private readonly alarmResultsRepository: Repository<AlarmResults>,
        @InjectRepository(Mates)
        private readonly matesRepository: Repository<Mates>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}
        private readonly adminCandidate = process.env.ADMIN_EMAILS.split(' ');
    async auth(tokens: AuthDto): Promise<AccessAndRefreshToken> {
        let newUser: Users, is_admin: boolean = false;
        const kakaoUser: KakaoAccountUsed = await this.kakaoService.getKakaoUser(tokens.accessToken);

        if (kakaoUser) {
            if (kakaoUser.email == undefined || kakaoUser.profile_image_url == undefined || kakaoUser.thumbnail_image_url == undefined) {
                throw new ForbiddenException(); 
            }
            if (this.adminCandidate.find(e => e === kakaoUser.email)) {
                is_admin = true;
            }
            const userAlreadyExist = await this.usersRepository.findOne({ where: { kakao_id: kakaoUser.id } });
            if (userAlreadyExist) {
                const appTokens =  this.authService.login({ id: userAlreadyExist.id, email: userAlreadyExist.email });
                const hashedRT = await bcrypt.hash(appTokens.appRefreshToken, 12);
                await this.updateUser(userAlreadyExist.id, {
                    device_token: tokens.deviceToken,
                    refresh_token: hashedRT,
                    kakao_access_token: tokens.accessToken,
                    kakao_refresh_token: tokens.refreshToken
                });
                return appTokens;
            } else {
                const queryRunner = this.dataSource.createQueryRunner();
                await queryRunner.connect();
                await queryRunner.startTransaction();
                try {
                    newUser = await queryRunner.manager.getRepository(Users).save({
                        kakao_id: kakaoUser.id,
                        email: kakaoUser.email,
                        nickname: kakaoUser.nickname,
                        profile_image_url: kakaoUser.profile_image_url,
                        thumbnail_image_url: kakaoUser.thumbnail_image_url,
                        age_range: kakaoUser.age_range,
                        gender: kakaoUser.gender,
                        is_admin: is_admin,
                        device_token: tokens.deviceToken,
                        kakao_access_token: tokens.accessToken,
                        kakao_refresh_token: tokens.refreshToken,
                        refresh_token: null
                    });

                    const newAsset = await queryRunner.manager.getRepository(Assets).save({
                        User_id: newUser.id,
                        coin: is_admin ? 9999999 : 0
                    });
                    await queryRunner.manager.getRepository(Users).createQueryBuilder()
                            .update()
                            .set({ Asset_id: newAsset.id })
                            .where('id = :id', { id: newUser.id })
                            .execute();
                    await queryRunner.commitTransaction();

                } catch (e) {
                    await queryRunner.rollbackTransaction();
                    throw new ForbiddenException('Invalid request');
                } finally {
                    await queryRunner.release();
                    const appTokens =  this.authService.login({ id: newUser.id, email: newUser.email });
                    await this.updateUser(newUser.id, {
                        refresh_token: await bcrypt.hash(appTokens.appRefreshToken, 12)
                    });
                    return appTokens;
                }
            }
        } else {
            throw new InvalidTokenException();
        }
    }
    
    async destroyToken(userId: number) {
        await this.updateUser(userId, { 
            refresh_token: null,
            device_token: null,
            kakao_access_token: null,
            kakao_refresh_token: null
        });
    }

    async deleteUser(userId: number) {
        try {
            await this.usersRepository.createQueryBuilder()
                .softDelete()
                .from(Users)
                .where('id = :id', { id: userId })
                .execute();
        } catch(e) {
            throw new ForbiddenException('Invalid request');
        }
        return 'OK';
    }
    
    /**
         * validate refresh token
         * generate new access & refresh token
         * https://velog.io/@jkijki12/Jwt-Refresh-Token-%EC%A0%81%EC%9A%A9%EA%B8%B0
    */
   
    async refreshAppToken(userId: number) {

        const { id, email } = await this.getUser(userId);
        const tokens = this.authService.login({ id, email });
        await this.updateUsersRefreshToken(id, tokens.appRefreshToken);
        return tokens;
    }
    async refreshKakaoToken(userId: number) {
        const { kakao_refresh_token } = await this.getUser(userId);
        const { accessToken, refreshToken } = await this.kakaoService.refreshKakaoTokens(kakao_refresh_token);
        await this.updateUser(userId, { 
            kakao_access_token: accessToken,
            kakao_refresh_token: refreshToken 
            }, ['kakao_access_token', 'kakao_refresh_token']
        );
    }

    
    async getUserProfile(myId: number, targetId: number): Promise<Users | OthersProfileDto> {
        const user = await this.usersRepository.findOneOrFail({ where: { id: targetId }})
                    .catch((e) => { throw new ForbiddenException('Access denied') });
        if (user.id === myId) {
            return user;
        }
        return {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            name: user.name,
            thumbnail_image_url: user.thumbnail_image_url,
            bio: user.bio,
            gender: user.gender,
        };
    }
    
    async editUserProfile(myId: number, { nickname, profile_image_url, thumbnail_image_url, bio }: EditProfileDto) {
        await this.updateUser(myId, { nickname, profile_image_url, thumbnail_image_url, bio });
        return 'OK';
    }
    
    async getUserAlarmRecords(myId: number, skip: number, take: number): Promise<AlarmPlayRecords[]> {
        if (!skip || !take) {
            skip = 0;
            take = 100;
        }
        return await this.alarmPlayRecordsRepository.createQueryBuilder('apr')
        .innerJoinAndSelect('apr.User', 'u', 'u.id = :myId', { myId })
        .skip(skip)
        .take(take)
        .getMany();
    }
    
    async getUsersHostedAlarm(myId: number): Promise<Alarms[]> {

        const cached = await this.cacheManager.get<Alarms[]>(`${myId}_hosted_alarms`);
        if (cached) {
            return cached;
        }
        const hostedAlarms = await this.alarmsRepository.createQueryBuilder('alarms')
        .innerJoin('alarms.Host', 'h', 'h.id = :myId', { myId })
        .innerJoin('alarms.Game', 'game')
        .innerJoin('alarms.Members', 'members')
        .select([
            'alarms.id',
            'alarms.time',
            'alarms.is_repeated',
            'alarms.is_private',
            'alarms.music_volume',
            'alarms.max_member',
            'alarms.created_at', 
            'game.id', 
            'game.name',
            'game.thumbnail_url',
            'members.id', 
            'members.nickname',
            'members.thumbnail_image_url'
        ])
        .getMany();
        await this.cacheManager.set(`${myId}_hosted_alarms`, hostedAlarms, { ttl: 60 * 60 * 24 });
        return hostedAlarms;
    }

    async getUsersJoinedAlarm(myId: number): Promise<Alarms[]> {

        const cached = await this.cacheManager.get<Alarms[]>(`${myId}_joined_alarms`);
        if (cached) {
            return cached;
        }
        const joinedAlarms = await this.alarmsRepository.createQueryBuilder('alarms')
                .innerJoin('alarms.Members', 'members', 'members.id = :myId', { myId })
                .select([
                    'alarms.id',
                ])
                .getMany();
        const joinedAlarmsIds = joinedAlarms.map(m => m.id);
        const returnJoinedAlarms = await this.alarmsRepository.find({
            select: {
                id: true,
                name: true,
                time: true,
                is_repeated: true,
                is_private: true,
                music_name: true,
                max_member: true,
                created_at: true,
                Game: {
                    id: true,
                    name: true,
                    thumbnail_url: true
                },
                Members: {
                    id: true,
                    nickname: true,
                    thumbnail_image_url: true,
                }
            },
            where: {
                id: In(joinedAlarmsIds)
            },
            relations: {
                Game: true,
                Members: true
            }
        });
        await this.cacheManager.set(`${myId}_joined_alarms`, returnJoinedAlarms, { ttl: 60 * 60 * 24 });
        return returnJoinedAlarms;
    }
    
    async getUserHistoryByAlarm(myId: number) {

        const cached = await this.cacheManager.get(`${myId}_records_by_alarm`);
        if (cached) {
            return cached;
        }
        const recordsByAlarm = await this.alarmPlayRecordsRepository.find({
            where: {
                User_id: myId,
                Alarm_result: {
                    Alarm: {
                        Members: {
                            id: Not(myId)
                        }
                    }
                }
            },
            select: {
                created_at: true,
                Alarm_result: {
                    start_time: true,
                    end_time: true,
                    Game: {
                        name: true,
                        thumbnail_url: true
                    },
                    data: {
                        play_time: true
                    },
                    Alarm: {
                        id: true,
                        Members: {
                            nickname: true,
                            thumbnail_image_url: true
                        }
                    }
                }
            },
            relations: {
                Alarm_result: {
                    Game: true,
                    Alarm: {
                        Members: true
                    }
                }
            },
            order: {
                created_at: "DESC"
            }
        });

        await this.cacheManager.set(`${myId}_records_by_alarm`, recordsByAlarm, { ttl: 60 * 60 * 24 });
        return recordsByAlarm;
    }
    
    async getUserHistoryByCount(myId: number) {
        const cached = await this.cacheManager.get(`${myId}_records_by_count`);
        if (cached) {
            return cached;
        }
        const SendedMates = await this.matesRepository.createQueryBuilder('m')
                    .select([
                        'Receiver_id as id',
                        'r.nickname as nickname',
                        'r.thumbnail_image_url as thumbnail_image_url',
                        'm.updated_at as updated_at'
                    ])
                    .innerJoin('m.Receiver', 'r')
                    .where('Sender_id = :myId', { myId })
                    .andWhere('Receiver_id != :myId', { myId })
                    .getRawMany();
        const ReceivedMates = await this.matesRepository.createQueryBuilder('m')
                        .select([
                            'Sender_id as id',
                            's.nickname as nickname',
                            's.thumbnail_image_url as thumbnail_image_url',
                            'm.updated_at as updated_at'
                        ])
                        .innerJoin('m.Sender', 's')
                        .where('Receiver_id = :myId', { myId })
                        .andWhere('Sender_id != :myId', { myId })
                        .getRawMany();
        
        const mates = [ ...SendedMates, ...ReceivedMates ];
        let playRecordsWithMates: MatePlayHistory[] = [];
        for await (let mate of mates) {
            let playCount = 0, successCount = 0, failCount = 0, mateDue = 0;
            mateDue = Math.floor((new Date().getTime() - mate.updated_at.getTime()) / (1000*60*60*24));

            const membersOfAlarmPlayedByMate = await this.alarmPlayRecordsRepository.query(
                `SELECT alarm_members.Alarm_id, GROUP_CONCAT(alarm_members.User_id) as User_ids 
                    FROM alarm_play_records INNER JOIN alarm_results on Alarm_result_id = alarm_results.id INNER JOIN alarm_members ON alarm_results.Alarm_id = alarm_members.Alarm_id 
                    WHERE alarm_play_records.User_id = ${mate.id} group by alarm_members.Alarm_id`
            );

            for await (let am of membersOfAlarmPlayedByMate) {
                am.User_ids = am.User_ids.split(',').map((uid: string) => Number(uid))
                if (am.User_ids.includes(mate.id) & am.User_ids.includes(myId)) {
                    playCount += 1;
                }
                // select * from alarm_results where Alarm_id = 42;
                const alamrResult = await this.alarmResultsRepository.findOneOrFail({
                    select: {
                        is_cleared: true
                    },
                    where: { Alarm_id: am.Alarm_id }
                });
                if (alamrResult.is_cleared) {
                    successCount += 1;
                } else {
                    failCount += 1;
                }
            }
            playRecordsWithMates.push({ 
                id: mate.id, 
                nickname: mate.nickname, 
                thumbnail_image_url: mate.thumbnail_image_url, 
                playCount, successCount, failCount, mateDue 
            });
        }
        await this.cacheManager.set(`${myId}_records_by_count`, playRecordsWithMates, { ttl: 60 * 60 * 24 });
        return playRecordsWithMates;

    }

    private async getUser(userId: number) {
        return await this.usersRepository.findOneOrFail({ where: { id: userId }})
                    .catch((e) => { throw new ForbiddenException('Access denied') });
    }

    private async updateUser(userId: number, condition: QueryDeepPartialEntity<Users>, keyNeededCheck?: string[]): Promise<string> {
        const user = await this.getUser(userId);
        
        if (keyNeededCheck) {
            keyNeededCheck.forEach(key => {
                if (!user[key]) {
                    throw new ForbiddenException('Invalid request');
                }
            })
        }
        
        try {
            await this.usersRepository.createQueryBuilder()
            .update(Users)
            .set(condition)
            .where('id = :userId', { userId: user.id })
            .execute();
            return 'OK';
        } catch(e) {
            throw new ForbiddenException('Invalid request');
        }
    }
    
    async syncJoinedAlarms() {
        
    }

    private async updateUsersRefreshToken(userId: number, refreshToken: string) {
        // this.redisService.setValue('appRT', userId, refreshToken);
        const hashedRT = await bcrypt.hash(refreshToken, 12);
        return await this.updateUser(userId, { refresh_token: hashedRT }, ['refresh_token']);
    }
    
    
}
