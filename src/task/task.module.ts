import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';

@Module({
  imports: [PushNotificationModule],
  providers: [TaskService],
  controllers: [TaskController]
})
export class TaskModule {}
