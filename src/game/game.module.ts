import { Logger, Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { SingleModule } from './single/single.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { Assets } from 'src/entities/assets.entity';
import { AgoraModule } from 'src/external/agora/agora.module';
import { GamesRatings } from 'src/entities/games.ratings.entity';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GameData, GameDataSchema } from 'src/schemas/gameData.schemas';
import {
  UserPlayData,
  UserPlayDataScheme,
} from 'src/schemas/userPlayData.schemas';
import { GameMeta, GameMetaSchema } from 'src/schemas/gameMeta.schemas';
import { GameRepository } from '../common/repository/game.repository';
import { QueryRunnerModule } from 'src/db/query-runner/query-runner.module';
import { UsersModule } from 'src/users/users.module';
import { RepositoryModule } from 'src/common/repository/repository.module';
import { UtilsModule } from 'src/common/utils/utils.module';

@Module({
  imports: [
    PushNotificationModule,
    SingleModule,
    AgoraModule,
    QueryRunnerModule,
    RepositoryModule,
    UtilsModule,
    UsersModule,
    TypeOrmModule.forFeature([
      GamePurchaseRecords,
      Assets,
      GamesRatings,
      AlarmMembers,
    ]),
    MongooseModule.forFeature([
      { name: GameData.name, schema: GameDataSchema },
      { name: GameMeta.name, schema: GameMetaSchema },
      { name: UserPlayData.name, schema: UserPlayDataScheme },
    ]),
  ],
  providers: [GameService, Logger, GameRepository],
  controllers: [GameController],
  exports: [GameService, GameRepository],
})
export class GameModule {}
