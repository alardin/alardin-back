import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AwsModule } from 'src/aws/aws.module';
import { AlarmPlayRecords } from 'src/entities/alarm.play.records.entity';
import { AlarmResults } from 'src/entities/alarm.results.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { Mates } from 'src/entities/mates.entity';
import { Users } from 'src/entities/users.entity';
import { KakaoModule } from 'src/external/kakao/kakao.module';
import { MateModule } from 'src/mate/mate.module';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';
import { UsersController } from './users.controller';
import { UserRepository } from '../common/repository/users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [
    KakaoModule,
    AuthModule,
    PushNotificationModule,
    MateModule,
    AwsModule,
    TypeOrmModule.forFeature([
      Users,
      Alarms,
      AlarmPlayRecords,
      AlarmResults,
      Mates,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, Logger, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
