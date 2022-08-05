import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { MateModule } from 'src/mate/mate.module';
import { AlarmController } from './alarm.controller';
import { AlarmService } from './alarm.service';

@Module({
  imports: [MateModule, TypeOrmModule.forFeature([Alarms, AlarmMembers, GamePurchaseRecords])],
  controllers: [AlarmController],
  providers: [AlarmService]
})
export class AlarmModule {}
