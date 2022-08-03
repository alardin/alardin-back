import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notifications } from 'src/entities/notifications.entity';
import { PushNotificationController } from './push-notification.controller';
import { PushNotificationService } from './push-notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notifications])],
  controllers: [PushNotificationController],
  providers: [PushNotificationService],
  exports: [PushNotificationService]
})
export class PushNotificationModule {}
