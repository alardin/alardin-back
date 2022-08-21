import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Mates } from 'src/entities/mates.entity';
import { Notifications } from 'src/entities/notifications.entity';
import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { Repository } from 'typeorm';

@Injectable()
export class TaskService {
    constructor(
        private readonly pushNotiService: PushNotificationService
    ) {}

    @Cron(new Date(Date.now() + 3 * 1000))
    handleCron() {
        this.pushNotiService.sendPush(1, 'cql2Nc4QTSa7oUmEVE2nKV:APA91bHJv9H0yGmdi2bG__DvcycHJjPeb7dI8ZYJD65m-XJ0QcJ4kETFwQSL8JFh5HgbRzRtcU3jZVtu4Qxp0ceZSfaLi5M2dDs8Z-TorM3pHiI3zaLw9YEMFmAXcMujVgDQos7GiGNP', 'test', 'test body');
    }
}
