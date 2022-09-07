import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessAndRefreshToken } from 'src/auth/auth';
import { AuthService } from 'src/auth/auth.service';
import { AlarmPlayRecords } from 'src/entities/alarm.play.records.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { Assets } from 'src/entities/assets.entity';
import { Users } from 'src/entities/users.entity';
import { KakaoAccountUsed } from 'src/external/kakao/kakao.types';
import { KakaoService } from 'src/external/kakao/kakao.service';
import { DataSource, Repository } from 'typeorm';
import { AuthDto } from './dto/auth.dto';
import { EditProfileDto } from './dto/edit-profile.dto';
import { OthersProfileDto } from './dto/others.profile.dto';
import * as bcrypt from 'bcryptjs';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { InvalidTokenException } from 'src/common/exceptions/invalid-token.exception';
import { AlarmResults } from 'src/entities/alarm.results.entity';

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
        private readonly alarmResultsRepository: Repository<AlarmResults>
    ) {}
        private readonly adminCandidate = process.env.ADMIN_EMAILS.split(' ');
    async auth(tokens: AuthDto): Promise<AccessAndRefreshToken> {
        let newUser: Users, is_admin: boolean = false;
        const kakaoUser: KakaoAccountUsed = await this.kakaoService.getKakaoUser(tokens.accessToken);

        if (kakaoUser) {
            if (this.adminCandidate.find(e => e === kakaoUser.email)) {
                is_admin = true;
            }
            const userAlreadyExist = await this.usersRepository.findOne({ where: { email: kakaoUser.email } });
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
    
    async logout(userId: number) {
        await this.updateUser(userId, { refresh_token: null });
    }
    
    /**
         * validate refresh token
         * generate new access & refresh token
         * https://velog.io/@jkijki12/Jwt-Refresh-Token-%EC%A0%81%EC%9A%A9%EA%B8%B0
    */
   
    async refreshTokens(userId: number, refreshToken: string) {
        if (!refreshToken) {
            return null;
        }
        const { id, email, refresh_token } = await this.getUser(userId);
        const tokenMatched = await bcrypt.compare(refreshToken, refresh_token);
        if (!tokenMatched) {
            throw new ForbiddenException('Access denied');
        }
        const tokens = this.authService.login({ id, email });
        await this.updateUsersRefershToken(id, tokens.appRefreshToken);
        return tokens;
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
        return await this.alarmsRepository.createQueryBuilder('alarms')
        .innerJoin('alarms.Host', 'h', 'h.id = :myId', { myId })
        .innerJoin('alarms.Game', 'game')
        .innerJoin('alarms.Members', 'members')
        .select([
            'alarms.id',
            'alarms.time',
            'alarms.is_repeated',
            'alarms.is_private',
            'alarms.music_volume',
            'alarms.max_members',
            'alarms.created_at', 
            'game.id', 
            'game.name',
            'game.thumbnail_url',
            'members.id', 
            'members.nickname',
            'members.thumbnail_image_url'
        ])
        .getMany();
    }

    async getUsersJoinedAlarm(myId: number): Promise<Alarms[]> {
        return await this.alarmsRepository.createQueryBuilder('alarms')
        .innerJoin('alarms.Game', 'game')
        .innerJoin('alarms.Members', 'members', 'members.id = :myId', { myId })
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
        .getMany();
    }
    
    async getUserHistoryByAlarm(myId: number) {
        return await this.alarmPlayRecordsRepository.find({
            where: {
                User_id: myId
            },
            select: {
                Alarm_result: {
                    start_time: true,
                    end_time: true,
                    trial: true,
                    Game: {
                        name: true,
                        thumbnail_url: true
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
            }
        });
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
                    throw new UnauthorizedException();
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
    
    private async updateUsersRefershToken(userId: number, refreshToken: string) {
        // this.redisService.setValue('appRT', userId, refreshToken);
        const hashedRT = await bcrypt.hash(refreshToken, 12);
        return await this.updateUser(userId, { refresh_token: hashedRT }, ['refresh_token']);
    }
    
    
}
