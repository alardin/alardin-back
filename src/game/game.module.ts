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

@Module({
  imports: [SingleModule, TypeOrmModule.forFeature([Games, GamesScreenshots, GamePurchaseRecords, Users, Assets])],
  providers: [GameService],
  controllers: [GameController],
})
export class GameModule {}
