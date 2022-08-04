import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assets } from 'src/entities/assets.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { Games } from 'src/entities/games.entity';
import { CoinUseRecords } from 'src/entities/coin.use.records.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assets, GamePurchaseRecords, Games, CoinUseRecords])],
  providers: [AssetsService],
  controllers: [AssetsController]
})
export class AssetsModule {}
