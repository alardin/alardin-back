import { BadRequestException, CACHE_MANAGER, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
    // constructor(
    //     @Inject(CACHE_MANAGER) private cacheManager: Cache
    // ) {}

    // async setValue(tokenType: 'appRT' | 'kakaoRT', userId: number, value: string) {
    //     return this.cacheManager.set(`${userId}:${tokenType}`, value, { ttl: 0 }).catch(e => {
    //         throw new InternalServerErrorException();
    //     });
    // }

    // async getValue(tokenType: 'appRT' | 'kakaoRT', userId: number) {
    //     return this.cacheManager.get(`${userId}:${tokenType}`).catch(e => {
    //         throw new InternalServerErrorException();
    //     });
    // }



}
