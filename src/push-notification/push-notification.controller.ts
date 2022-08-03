import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { userInfo } from 'os';
import { User } from 'src/common/decorators/user.decorator';
import { SendPushDto } from './dto/send-push.dto';
import { PushNotificationService } from './push-notification.service';

@ApiTags('push-notification')
@Controller('api/push-notification')
export class PushNotificationController {
    constructor(
        private readonly pushNotificationService: PushNotificationService
    ) {}

    @ApiOperation({
        summary: 'push 알림 전송',
        description: 'notification 타입 알림 전송'
    })
    @Post()
    async sendPushNotification(
        @User() user,
        @Body() { deviceToken, title, body }: SendPushDto
    ) {
        return await this.pushNotificationService.sendPush(user.id, deviceToken, title, body);
    }

    @ApiOperation({
        summary: 'push 데이터 전송',
        description: 'data 타입 알림 전송'
    })
    @Post('data')
    sendPushData() {

    }

    @ApiOperation({
        summary: 'push 알림&데이터 전송',
        description: 'notification & data 타입 알림 전송'
    })
    @Post('both')
    sendPushBoth() {

    }

}
