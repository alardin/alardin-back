import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alarms } from 'src/entities/alarms.entity';
import { MateModule } from 'src/mate/mate.module';
import { AlarmController } from './alarm.controller';
import { AlarmService } from './alarm.service';

@Module({
  imports: [MateModule, TypeOrmModule.forFeature([Alarms])],
  controllers: [AlarmController],
  providers: [AlarmService]
})
export class AlarmModule {}
