import { Body, Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { GenerateRtcTokenDto } from '../dto/generate-token.dto';
import { AgoraService } from './agora.service';

@ApiTags('agora')
@Controller('api/agora')
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
    @Get('rtm-test')
    rtmTokenTest(@Query('account') account: string | number, @Query('expiry') expiry: number) {
        return this.agoraService.generateRtmToken(account, expiry);
    }

    @Get('rtc-test')
    rtcTokenTest(@Body() { channelName, role, tokenType, uid }: GenerateRtcTokenDto, @Query('expiry') expiry) {
        return this.agoraService.generateRtcToken(channelName, role, tokenType, uid, expiry)
    }
}
