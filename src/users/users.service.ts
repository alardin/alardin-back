import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessAndRefreshToken } from 'src/auth/auth';
import { AuthService } from 'src/auth/auth.service';
import { AlarmPlayRecords } from 'src/entities/alarm.play.records.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { Assets } from 'src/entities/assets.entity';
import { Users } from 'src/entities/users.entity';
import { KakaoAccountUsed } from 'src/external/kakao/kakao';
import { KakaoService } from 'src/external/kakao/kakao.service';
import { RedisService } from 'src/redis/redis.service';
import { DataSource, Repository } from 'typeorm';
import { AuthDto } from './dto/auth.dto';
import { EditProfileDto } from './dto/edit-profile.dto';
import { OthersProfileDto } from './dto/others.profile.dto';
import * as bcrypt from 'bcrypt';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { InvalidTokenException } from 'src/common/exceptions/invalid-token.exception';

@Injectable()
export class UsersService {
    constructor(
        private readonly kakaoService: KakaoService,
        private readonly authService: AuthService,
        private readonly redisService: RedisService,
        private dataSource: DataSource,
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(Alarms)
        private readonly alarmsRepository: Repository<Alarms>,
        @InjectRepository(AlarmPlayRecords)
        private readonly alarmPlayRecordsRepository: Repository<AlarmPlayRecords>
    ) {}
        private readonly adminCandidate = process.env.ADMIN_EMAILS.split(' ');
    async auth(tokens: AuthDto): Promise<AccessAndRefreshToken> {
        let newUser: Users, is_admin: boolean = false;
        const kakaoUser: KakaoAccountUsed = await this.kakaoService.getKakaoUser(tokens.accessToken);
        if (kakaoUser) {
            if (kakaoUser.email in this.adminCandidate) {
                is_admin = true;
            }
            const userAlreadyExist = await this.usersRepository.findOne({ where: { email: kakaoUser.email } });
            if (userAlreadyExist) {
                const appTokens =  this.authService.login({ id: userAlreadyExist.id, email: userAlreadyExist.email });
                const hashedRT = await bcrypt.hash(appTokens.appRefreshToken, 12);
                await this.updateUser(userAlreadyExist.id, {
                    device_token: tokens.deviceToken,
                    refresh_token: hashedRT
                });
                return appTokens;
            } else {
                const queryRunner = this.dataSource.createQueryRunner();
                queryRunner.connect();
                queryRunner.startTransaction();
                try {
                    newUser = await queryRunner.manager.getRepository(Users).save({
                        email: kakaoUser.email,
                        nickname: kakaoUser.nickname,
                        profile_image_url: kakaoUser.profile_image_url,
                        thumbnail_image_url: kakaoUser.thumbnail_image_url,
                        age_range: kakaoUser.age_range,
                        gender: kakaoUser.gender,
                        is_admin: is_admin,
                        device_token: tokens.deviceToken,
                        refresh_token: null
                    });
                    await queryRunner.manager.getRepository(Assets).save({
                        User_id: newUser.id
                    });

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
        return await this.updateUser(myId, { nickname, profile_image_url, thumbnail_image_url, bio });
    }
    
    async getUserAlarmRecords(myId: number): Promise<AlarmPlayRecords[]> {
        return await this.alarmPlayRecordsRepository.createQueryBuilder('apr')
        .innerJoinAndSelect('apr.User', 'u', 'u.id = :myId', { myId })
        .getMany();
    }
    
    async getUsersHostedAlarm(myId: number): Promise<Alarms[]> {
        return await this.alarmsRepository.createQueryBuilder('alarms')
        .innerJoinAndSelect('alarms.Host', 'h', 'h.id = :myId', { myId })
        .getMany();
    }
    async getUsersJoinedAlarm(myId: number): Promise<Alarms[]> {
        return await this.alarmsRepository.createQueryBuilder('alarms')
        .innerJoinAndSelect('alarms.Members', 'm', 'm.id = :myId', { myId })
        .getMany();
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

    test() {
        console.log(this.adminCandidate);
    }
    
    
}
