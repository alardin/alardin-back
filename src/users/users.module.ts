import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { AlarmPlayRecords } from 'src/entities/alarm.play.records.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { Users } from 'src/entities/users.entity';
import { KakaoModule } from 'src/external/kakao/kakao.module';
import { RedisModule } from 'src/internal/redis/redis.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [KakaoModule, AuthModule, RedisModule,
    TypeOrmModule.forFeature([Users, Alarms, AlarmPlayRecords])],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
