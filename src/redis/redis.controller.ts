import { BadRequestException, Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InternalGuard } from 'src/common/guards/internal.guard';
import { RedisService } from './redis.service';

@UseGuards(InternalGuard)
@Controller('api/internal/redis')
export class RedisController {
    // constructor(
    //     private readonly redisService: RedisService
    // ) {}
    // @ApiOperation({
    //     summary: 'set/get refreshToken in redis'
    // })
    // @Get()
    // async saveRefreshToken (
    //     @Query('cmd') cmd: 'set' | 'get',
    //     @Query('tokenType') tokenType: 'appRT' | 'kakaoRT',
    //     @Query('userId') userId: number,
    //     @Query('value') value?: string 
    // ) {
    //     if (tokenType !== 'appRT' && tokenType !== 'kakaoRT') {
    //         throw new BadRequestException('Bad token type'); 
    //     }
    //     switch(cmd) {
    //         case 'set':
    //             return await this.redisService.setValue(tokenType, userId, value);
    //         case 'get':
    //             return await this.redisService.getValue(tokenType, userId);
    //         default:
    //             throw new BadRequestException('Bad type for user');
    //     }
    // }

}
