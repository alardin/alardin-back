import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { GameUsedImages } from 'src/entities/game.used-images.entity';
import { Games } from 'src/entities/games.entity';
import { Mates } from 'src/entities/mates.entity';
import { Users } from 'src/entities/users.entity';
import { GameModule } from 'src/game/game.module';
import { MateModule } from 'src/mate/mate.module';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';
import { GameData, GameDataSchema } from 'src/schemas/gameData.schemas';
import { AlarmController } from './alarm.controller';
import { AlarmService } from './alarm.service';

@Module({
  imports: [MateModule, GameModule, PushNotificationModule,
    TypeOrmModule.forFeature([Alarms, AlarmMembers, GamePurchaseRecords, GameUsedImages, Users, Games, Mates]),
    MongooseModule.forFeature([{ name: GameData.name, schema: GameDataSchema }])],
  controllers: [AlarmController],
  providers: [AlarmService, Logger]
})
export class AlarmModule {}
