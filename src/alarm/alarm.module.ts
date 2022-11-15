import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { Games } from 'src/entities/games.entity';
import { Mates } from 'src/entities/mates.entity';
import { Users } from 'src/entities/users.entity';
import { MateModule } from 'src/mate/mate.module';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';
import { GameData, GameDataSchema } from 'src/schemas/gameData.schemas';
import { AlarmController } from './alarm.controller';
import { AlarmService } from './alarm.service';

@Module({
  imports: [
    MateModule,
    PushNotificationModule,
    TypeOrmModule.forFeature([
      Alarms,
      AlarmMembers,
      GamePurchaseRecords,
      Users,
      Games,
      Mates,
    ]),
    MongooseModule.forFeature([
      { name: GameData.name, schema: GameDataSchema },
    ]),
  ],
  controllers: [AlarmController],
  providers: [AlarmService, Logger],
  exports: [AlarmService],
})
export class AlarmModule {}
