import { Logger, Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { SingleModule } from './single/single.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Games } from 'src/entities/games.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { Users } from 'src/entities/users.entity';
import { Assets } from 'src/entities/assets.entity';
import { AgoraModule } from 'src/external/agora/agora.module';
import { GamesRatings } from 'src/entities/games.ratings.entity';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GameData, GameDataSchema } from 'src/schemas/gameData.schemas';
import { UserPlayData, UserPlayDataScheme } from 'src/schemas/userPlayData.schemas';
import { GameMeta, GameMetaSchema } from 'src/schemas/gameMeta.schemas';
import { AlarmService } from 'src/alarm/alarm.service';
import { AlarmModule } from 'src/alarm/alarm.module';

@Module({
  imports: [GameModule, PushNotificationModule, SingleModule, AgoraModule, AlarmModule,
    TypeOrmModule.forFeature([Games, GamePurchaseRecords, Users, Assets, GamesRatings, AlarmMembers, Alarms ]),
    MongooseModule.forFeature([
      { name: GameData.name, schema: GameDataSchema },
      { name: GameMeta.name, schema: GameMetaSchema },
      { name: UserPlayData.name, schema: UserPlayDataScheme }
    ]),
  ],
  providers: [GameService, Logger],
  controllers: [GameController],
  exports: [GameService]
})
export class GameModule {}
