import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { InvalidTokenException } from 'src/common/exceptions/invalid-token.exception';
import { Users } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { KakaoAccount, KakaoAccountUsed, KakaoFriend } from './kakao.types';
import * as qs from 'qs';
@Injectable()
export class KakaoService {

    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>
    ) {}
    private readonly kakaoApiHost = "https://kapi.kakao.com"
    private readonly kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';
    private readonly kakaoMeUrl = `${this.kakaoApiHost}/v2/user/me`;
    private readonly kakaoFriendsUrl = `${this.kakaoApiHost}/v1/api/talk/friends`;
    private readonly kakaoAdminKey = process.env.KAKAO_ADMIN_KEY;
    private readonly kakaoRestApiKey = process.env.KAKAO_REST_API_KEY;

    /**
     * kakaoAuth는 id, email, accessToken, refreshToken만 리턴하도록!
     * jwt 생성하는 건 auth로 분리하자.
     */
    async getKakaoUser(accessToken: string): Promise<KakaoAccountUsed> {
        const kakaoAccount = await this.getKakaoProfile(accessToken);
        if (kakaoAccount) {
            return {
                id: kakaoAccount.id,
                email: kakaoAccount.email,
                nickname: kakaoAccount.profile.nickname,
                thumbnail_image_url: kakaoAccount.profile.thumbnail_image_url,
                profile_image_url: kakaoAccount.profile.profile_image_url,
                age_range: kakaoAccount.age_range,
                gender: kakaoAccount.gender
            };
        }
        return null;
    }
    
    private async getKakaoProfile(accessToken: string): Promise<KakaoAccount> {
        const { data: {
            id,
            kakao_account
        } } = await axios.get(this.kakaoMeUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
        }).catch(_ => { throw new UnauthorizedException()});
        return { id, ...kakao_account };
    }

    async getKakaoFriends(accessToken: string): Promise<KakaoFriend[]> {
        const {
            data: {
                elements
            }
        } = await axios.get(this.kakaoFriendsUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }).catch(e => { throw new UnauthorizedException() });
        return elements;
    }
    
    async refreshKakaoTokens(refreshToken: string) {
        const { data } = await axios.post(this.kakaoTokenUrl, qs.stringify({
            "grant_type": "refresh_token",
            "client_id": this.kakaoRestApiKey,
            "refresh_token": refreshToken
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }).catch(e => console.log(e));
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token ? data.refresh_token : refreshToken
        };
    }


}
