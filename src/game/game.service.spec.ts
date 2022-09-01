import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { Assets } from 'src/entities/assets.entity';
import { GamePlayImages } from 'src/entities/game-play.images.entity';
import { GamePlayKeywords } from 'src/entities/game-play.keywords.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { GameUsedImages } from 'src/entities/game.used-images.entity';
import { Games } from 'src/entities/games.entity';
import { GamesRatings } from 'src/entities/games.ratings.entity';
import { GamesScreenshots } from 'src/entities/games.screenshots.entity';
import { Users } from 'src/entities/users.entity';
import { AgoraModule } from 'src/external/agora/agora.module';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';
import { GameModule } from './game.module';
import { GameService } from './game.service';
import { SingleModule } from './single/single.module';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GameModule, PushNotificationModule, SingleModule, AgoraModule, TypeOrmModule.forFeature([Games, GamesScreenshots, GamePurchaseRecords, Users, Assets, GamePlayKeywords, GamePlayImages, GameUsedImages, GamesRatings, AlarmMembers, Alarms ])],
      providers: [GameService],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
