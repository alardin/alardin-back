import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AlarmPlayRecords } from 'src/entities/alarm.play.records.entity';
import { AlarmResults } from 'src/entities/alarm.results.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { Mates } from 'src/entities/mates.entity';
import { Users } from 'src/entities/users.entity';
import { KakaoModule } from 'src/external/kakao/kakao.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [KakaoModule, AuthModule,
    TypeOrmModule.forFeature([Users, Alarms, AlarmPlayRecords, AlarmResults, Mates])],
  controllers: [UsersController],
  providers: [UsersService, Logger]
})
export class UsersModule {}
