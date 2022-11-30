import { Logger, Module } from '@nestjs/common';
import { MateService } from './mate.service';
import { MateController } from './mate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mates } from 'src/entities/mates.entity';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';
import { Users } from 'src/entities/users.entity';
import { MateRequestRecords } from 'src/entities/mate-request.records.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { KakaoModule } from 'src/external/kakao/kakao.module';
import { MateRepository } from '../common/repository/mate.repository';

@Module({
  imports: [
    PushNotificationModule,
    KakaoModule,
    TypeOrmModule.forFeature([Mates, Users, MateRequestRecords, Alarms]),
  ],
  providers: [MateService, Logger, MateRepository],
  controllers: [MateController],
  exports: [MateService, MateRepository],
})
export class MateModule {}
