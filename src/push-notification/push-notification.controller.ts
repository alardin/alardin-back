import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ForRoles } from 'src/common/decorators/for-roles.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { SendPushDto } from './dto/send-push.dto';
import { SendTopicDto } from './dto/send-topic.dto';
import { PushNotificationService } from './push-notification.service';

@ApiTags('notification')
@Controller('api/notification')
export class PushNotificationController {
    constructor(
        private readonly pushNotificationService: PushNotificationService
    ) {}

    @ApiOperation({
        summary: 'push 알림 전송',
        description: 'notification 타입 알림 전송'
    })
    @ApiBody({
        type: SendPushDto, 
    })
    @ForRoles(['admin'])
    @UseGuards(new RoleGuard(new Reflector()))
    @Post('topic')
    async sendPushNotificationByAdmin(
        @User() user,
        @Body() { topic, data, title, body }: SendTopicDto
    ) {
        return await this.pushNotificationService.sendPushToTopic(topic, title, body, data);
    }


}
