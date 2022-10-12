import { ForbiddenException, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { InvalidTokenException } from 'src/common/exceptions/invalid-token.exception';
import { Users } from 'src/entities/users.entity';
import { DataSource, Repository } from 'typeorm';
import { AccessAndRefreshToken } from './auth';
import * as bcrypt from 'bcryptjs';
import appleSignin from 'apple-signin-auth';
import { UsersService } from 'src/users/users.service';
import { AppleLoginDto } from './dto/apple-login.dto';
import { Assets } from 'src/entities/assets.entity';
import { AuthDto } from 'src/users/dto/auth.dto';
import { KakaoAccountUsed } from 'src/external/kakao/kakao.types';
import { KakaoService } from 'src/external/kakao/kakao.service';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(Users) 
        private readonly usersRepository: Repository<Users>,
        private readonly kakaoService: KakaoService,
        private dataSource: DataSource
    ) {}

    async validateUser(userId: number, email: string) {
        const user = await this.usersRepository.findOne({
            where: {
                id: userId,
                email
            }
        });
        if (!user) {
            return null;
        }
        return user;
    }

    async validateRefreshToken(userId: number, email: string, refreshToken: any): Promise<Users> | null {
        const user = await this.usersRepository.findOneOrFail({ where: { id: userId, email }})
            .catch(_ => { throw new InvalidTokenException() });
        const tokenMatched = await bcrypt.compare(refreshToken, user.refresh_token);
        if (!tokenMatched) {
            return null;
        }
        return user;
    }

    login({ id, email }): AccessAndRefreshToken {
        return {
            appAccessToken: this.jwtService.sign({ email }, {
                expiresIn: '12h',
                subject: String(id),
                issuer: 'alardin',
                secret: process.env.JWT_SECRET
            }),
            appRefreshToken: this.jwtService.sign({ email }, {
                expiresIn: '30d',
                subject: String(id),
                issuer: 'alardin',
                secret: process.env.JWT_SECRET
            })
        };
    }


    async kakaoAuth(tokens: AuthDto): Promise<AccessAndRefreshToken> {
        let newUser: Users, is_admin: boolean = false;
        const adminCandidate = process.env.ADMIN_EMAILS.split(' ');
        const kakaoUser: KakaoAccountUsed = await this.kakaoService.getKakaoUser(tokens.accessToken);
        if (kakaoUser) {
            if (kakaoUser.email == undefined || kakaoUser.profile_image_url == undefined || kakaoUser.thumbnail_image_url == undefined) {
                throw new ForbiddenException(); 
            }
            if (adminCandidate.find(e => e === kakaoUser.email)) {
                is_admin = true;
            }
            const userAlreadyExist = await this.usersRepository.findOne({ where: { kakao_id: kakaoUser.id } });
            if (userAlreadyExist) {
                const appTokens =  this.login({ id: userAlreadyExist.id, email: userAlreadyExist.email });
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
                    const appTokens =  this.login({ id: newUser.id, email: newUser.email });
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


    async appleAuth(data: AppleLoginDto, deviceToken: string) {
        let newUser: Users, is_admin: boolean = false;
        // const clientSecret = appleSignin.getClientSecret({
        //     clientID,
        //     teamID: process.env.APPLE_TEAM_ID,
        //     keyIdentifier: process.env.APPLE_KEY_ID,
        //     privateKey: process.env.APPLE_PRIVATE_KEY
        // });
        // const options = {
        //     clientID,
        //     redirectUri: process.env.APPLE_REDIRECT_URI,
        //     clientSecret
        // }

        try {
            const { sub: appleId, email } = await appleSignin.verifyIdToken(data.identityToken);

            const userAlreadyExist = await this.usersRepository.findOne({ where: { apple_id: appleId } });
            if (userAlreadyExist) {
                const appTokens =  this.login({ id: userAlreadyExist.id, email: userAlreadyExist.email });
                const hashedRT = await bcrypt.hash(appTokens.appRefreshToken, 12);
                await this.updateUser(userAlreadyExist.id, {
                    device_token: deviceToken,
                    refresh_token: hashedRT,
                });
                return appTokens;
            } else {
                const queryRunner = this.dataSource.createQueryRunner();
                await queryRunner.connect();
                await queryRunner.startTransaction();
                try {
                    newUser = await queryRunner.manager.getRepository(Users).save({
                        nickname: data.fullName.familyName + data.fullName.givenName,
                        profile_image_url: process.env.DEFAULT_PROFILE_URL,
                        thumbnail_image_url: process.env.DEFAULT_THUMBNAIL_IMAGE_URL,
                        device_token: deviceToken,
                        apple_id: appleId,
                        apple_email: email,
                        is_admin,
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
                    const appTokens =  this.login({ id: newUser.id, email: newUser.email });
                    await this.updateUser(newUser.id, {
                        refresh_token: await bcrypt.hash(appTokens.appRefreshToken, 12)
                    });
                    return appTokens;
                }
            }
        } catch(e) {
            throw new UnauthorizedException(e);
        }
    }
    private async getUser(userId: number) {
        return await this.usersRepository.findOneOrFail({ where: { id: userId }})
                    .catch((e) => { throw new ForbiddenException('Access denied') });
    }
    async updateUser(userId: number, condition: QueryDeepPartialEntity<Users>, keyNeededCheck?: string[]): Promise<string> {
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
}
