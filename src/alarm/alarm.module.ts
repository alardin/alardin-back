import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { GameUsedImages } from 'src/entities/game.used-images.entity';
import { Users } from 'src/entities/users.entity';
import { GameModule } from 'src/game/game.module';
import { MateModule } from 'src/mate/mate.module';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';
import { AlarmController } from './alarm.controller';
import { AlarmService } from './alarm.service';

@Module({
  imports: [MateModule, GameModule, PushNotificationModule,TypeOrmModule.forFeature([Alarms, AlarmMembers, GamePurchaseRecords, GameUsedImages, Users])],
  controllers: [AlarmController],
  providers: [AlarmService]
})
export class AlarmModule {}
