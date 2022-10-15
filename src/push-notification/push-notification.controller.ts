import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
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

    // @ApiOperation({
    //     summary: 'push 알림 전송',
    //     description: 'notification 타입 알림 전송'
    // })
    // @ApiBody({
    //     type: SendPushDto, 
    // })
    // @ForRoles(['admin'])
    // @UseGuards(new RoleGuard(new Reflector()))
    // @Post()
    // async sendPushNotificationByAdmin(
    //     @User() user,
    //     @Body() { data, title, body }: SendPushDto
    // ) {
    //     return await this.pushNotificationService.sendPushByAdmin(user.id, user.device_token, title, body, data);
    // }


}
