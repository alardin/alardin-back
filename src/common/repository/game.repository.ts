import { Injectable } from '@nestjs/common';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { Games } from 'src/entities/games.entity';
import { GamesRatings } from 'src/entities/games.ratings.entity';
import { DataSource, Repository } from 'typeorm';
import {
  GameFindOption,
  GamePurchaseFindOption,
  GameRatingSaveOption,
} from '../../game/game.types';

@Injectable()
export class GameRepository extends Repository<Games> {
  constructor(private readonly dataSource: DataSource) {
    super(
      Games,
      dataSource.createEntityManager(),
      dataSource.createQueryRunner(),
    );
  }

  async findById({ id }: GameFindOption) {
    return this.findOneOrFail({
      where: {
        id,
      },
    });
  }

  async findPurchasedGame({ userId, gameId }: GamePurchaseFindOption) {
    return this.dataSource.getRepository(GamePurchaseRecords).findOne({
      where: {
        Game: {
          id: gameId,
        },
        User: {
          id: userId,
        },
      },
    });
  }

  /**
    * entityManager.getRepository(GamesRatings).save({
        Game_id: game.id,
        User_id: myId,
        score,
      });
    */
  async saveRating({
    userId,
    gameId,
    score,
    entityManager,
  }: GameRatingSaveOption) {
    const newRating = new GamesRatings();
    newRating.Game_id = gameId;
    newRating.User_id = userId;
    newRating.score = score;
    if (entityManager) {
      return entityManager.save(newRating);
    } else {
      return this.dataSource.getRepository(GamesRatings).save(newRating);
    }
  }
}
