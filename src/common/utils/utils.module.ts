import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';
import { GameData, GameDataSchema } from 'src/schemas/gameData.schemas';
import { GameMeta, GameMetaSchema } from 'src/schemas/gameMeta.schemas';
import {
  UserPlayData,
  UserPlayDataScheme,
} from 'src/schemas/userPlayData.schemas';
import { RepositoryModule } from '../repository/repository.module';
import { AlarmUtils } from './alarm.utils';
import { GameUtils } from './game.utils';

@Module({
  imports: [
    PushNotificationModule,
    RepositoryModule,
    MongooseModule.forFeature([
      { name: GameData.name, schema: GameDataSchema },
      { name: GameMeta.name, schema: GameMetaSchema },
      { name: UserPlayData.name, schema: UserPlayDataScheme },
    ]),
  ],
  providers: [AlarmUtils, GameUtils],
  exports: [AlarmUtils, GameUtils],
})
export class UtilsModule {}
