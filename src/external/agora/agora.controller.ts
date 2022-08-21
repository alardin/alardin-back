import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { AgoraInterceptor } from 'src/common/interceptors/agora.interceptor';
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
    @Public()
    @UseInterceptors(AgoraInterceptor)
    @Get('rtm-test')
    rtmTokenTest(@Query('account') account: string, @Query('expiry') expiry: number) {
        return this.agoraService.generateRtmToken(account, expiry);
    }

    @Public()
    @UseInterceptors(AgoraInterceptor)
    @Post('rtc-test')
    rtcTokenTest(@Body() { channelName, role, tokenType, uid }: GenerateRtcTokenDto, @Query('expiry') expiry) {
        return this.agoraService.generateRtcToken(channelName, role, tokenType, uid, expiry)
    }
}
