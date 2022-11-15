import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assets } from 'src/entities/assets.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { Games } from 'src/entities/games.entity';
import { CoinUseRecords } from 'src/entities/coin.use.records.entity';
import { ChangeCoinDto } from './dto/change.coin.dto';
@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Assets)
    private readonly assetsRepository: Repository<Assets>,
    @InjectRepository(GamePurchaseRecords)
    private readonly gamePurRecordsRepository: Repository<GamePurchaseRecords>,
    @InjectRepository(Games)
    private readonly gamesRepository: Repository<Games>,
    @InjectRepository(CoinUseRecords)
    private readonly coinUseRecordsRepository: Repository<CoinUseRecords>,
  ) {}

  async getAssetAndOwnedGames(myId: number) {
    const asset = await this.getAssetById(myId);
    const games = await this.getOwnedGames(myId);
    return {
      asset,
      games,
    };
  }

  async getCoinAmount(myId: number) {
    const asset = await this.getAssetById(myId);
    return asset.coin;
  }

  async getOwnedGames(myId: number) {
    return await this.gamesRepository
      .createQueryBuilder('games')
      .innerJoin('games.Game_purchase_records', 'gpr')
      .innerJoin('gpr.User', 'u', 'u.id = :myId', { myId })
      .getMany();
  }

  async getIsPremium(myId: number) {
    const asset = await this.getAssetById(myId);
    return asset.is_premium;
  }

  // 결제 모듈 필요하다..
  async changeCoinAmount(myId: number, body: ChangeCoinDto) {}

  async upgradeToPremium(myId: number) {}

  async degradeFromPremium() {}

  private async getAssetById(myId: number) {
    return await this.assetsRepository
      .findOneOrFail({ where: { User_id: myId } })
      .catch(_ => {
        throw new ForbiddenException();
      });
  }
}
