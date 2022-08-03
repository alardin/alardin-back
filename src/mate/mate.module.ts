import { Module } from '@nestjs/common';
import { MateService } from './mate.service';
import { MateController } from './mate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mates } from 'src/entities/mates.entity';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';
import { Users } from 'src/entities/users.entity';
import { MateRequestRecords } from 'src/entities/mate-request.records.entity';
import { Alarms } from 'src/entities/alarms.entity';

@Module({
  imports: [PushNotificationModule, TypeOrmModule.forFeature([Mates, Users, MateRequestRecords, Alarms])],
  providers: [MateService],
  controllers: [MateController]
})
export class MateModule {}
