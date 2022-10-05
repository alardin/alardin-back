import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { SingleModule } from './single/single.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Games } from 'src/entities/games.entity';
import { GamesScreenshots } from 'src/entities/games.screenshots.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { Users } from 'src/entities/users.entity';
import { Assets } from 'src/entities/assets.entity';
import { GamePlayKeywords } from 'src/entities/game-play.keywords.entity';
import { GamePlayImages } from 'src/entities/game-play.images.entity';
import { AgoraModule } from 'src/external/agora/agora.module';
import { GameUsedImages } from 'src/entities/game.used-images.entity';
import { GamesRatings } from 'src/entities/games.ratings.entity';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GameData, GameDataSchema } from 'src/schemas/gameData.schemas';

@Module({
  imports: [GameModule, PushNotificationModule, SingleModule, AgoraModule, 
    TypeOrmModule.forFeature([Games, GamesScreenshots, GamePurchaseRecords, Users, Assets, GamePlayKeywords, GamePlayImages, GameUsedImages, GamesRatings, AlarmMembers, Alarms ]),
    MongooseModule.forFeature([{ name: GameData.name, schema: GameDataSchema }]),
  ],
  providers: [GameService],
  controllers: [GameController],
  exports: [GameService]
})
export class GameModule {}
