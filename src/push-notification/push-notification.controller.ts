import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ForRoles } from 'src/common/decorators/for-roles.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
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
    @ForRoles(['admin'])
    @UseGuards(new RoleGuard(new Reflector()))
    @Post()
    async sendPushNotification(
        @User() user,
        @Body() { deviceToken, title, body }: SendPushDto
    ) {
        return await this.pushNotificationService.sendPush(user.id, deviceToken, title, body);
    }

    // @ApiOperation({
    //     summary: 'push 데이터 전송',
    //     description: 'data 타입 알림 전송'
    // })
    // @Post('data')
    // sendPushData() {

    // }

    // @ApiOperation({
    //     summary: 'push 알림&데이터 전송',
    //     description: 'notification & data 타입 알림 전송'
    // })
    // @Post('both')
    // sendPushBoth() {

    // }

}
