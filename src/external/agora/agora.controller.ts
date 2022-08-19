import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { AgoraService } from './agora.service';

@Controller('agora')
export class AgoraController {

    constructor(
        private readonly agoraService: AgoraService
    ) {}

    @ApiQuery({
        name: 'account',
        example: 'test_user_id'
    })
    @ApiQuery({
        name: 'expiry',
        example: '3600 or undefined'
    })
    @Get('test')
    rtmTokenTest(@Query('account') account: string | number, @Query('expiry') expiry: number) {
        return this.agoraService.generateRtmToken(account, expiry);
    }
}
