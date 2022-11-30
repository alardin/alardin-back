import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { AlarmRepository } from 'src/common/repository/alarm.repository';
import { NotAllowedRequestException } from 'src/common/exceptions/exceptions';
import { QueryRunnerProvider } from 'src/db/query-runner/query-runner';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { AlarmPlayRecords } from 'src/entities/alarm.play.records.entity';
import { Assets } from 'src/entities/assets.entity';
import { CoinUseRecords } from 'src/entities/coin.use.records.entity';
import { GameChannel } from 'src/entities/game.channel.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { Games } from 'src/entities/games.entity';
import { AgoraService } from 'src/external/agora/agora.service';
import { GameData, GameDataDocument } from 'src/schemas/gameData.schemas';
import { GameMeta } from 'src/schemas/gameMeta.schemas';
import {
  UserPlayData,
  UserPlayDataDocument,
} from 'src/schemas/userPlayData.schemas';
import { UserRepository } from 'src/common/repository/users.repository';
import { DataSource, Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { InsertDto } from './dto/insert.dto';
import { SaveGameDto } from './dto/save-game.dto';
import { GameRepository } from '../common/repository/game.repository';
import { GameUtils } from '../common/utils/game.utils';
import { AlarmUtils } from 'src/common/utils/alarm.utils';

type GameDetail = {
  game: Games;
  gameScreenshots: string[];
};

@Injectable()
export class GameService {
  constructor(
    private readonly gameUtils: GameUtils,
    private readonly gameRepoistory: GameRepository,
    private readonly userRepository: UserRepository,
    private readonly alarmRepository: AlarmRepository,
    private readonly queryRunnerProvider: QueryRunnerProvider,
    private readonly alarmUtils: AlarmUtils,
    @InjectRepository(Assets)
    private readonly assetsRepositry: Repository<Assets>,
    @InjectRepository(AlarmMembers)
    private readonly alarmMembersRepository: Repository<AlarmMembers>,
    private readonly agoraService: AgoraService,
    @InjectModel(GameData.name) private gameDataModel: Model<GameDataDocument>,
    @InjectModel(UserPlayData.name)
    private userPlayDataModel: Model<UserPlayDataDocument>,
    @InjectModel(GameMeta.name) private gameMetaModel: Model<GameMeta>,
    private dataSource: DataSource,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {}
  async getAllGames(skip: number, take: number) {
    return await this.gameRepoistory.find({
      skip,
      take,
    });
  }

  async getGameDetailsById(gameId: number): Promise<GameDetail> {
    const game = await this.gameRepoistory.findById({ id: gameId }).catch(e => {
      throw new BadRequestException();
    });
    const gameMeta = await this.gameMetaModel
      .findOne({
        Game_id: game.id,
      })
      .exec();
    return {
      game,
      gameScreenshots: gameMeta.screenshot_urls,
    };
  }

  async createNewGame(body: CreateGameDto) {
    const { screenshot_urls, keys, name, data_keys, ...bodyWithoutMeta } = body;
    const entityManager = await this.queryRunnerProvider.init();
    try {
      const newGame = entityManager.create(Games, {
        name,
        ...bodyWithoutMeta,
      });
      await entityManager.save(newGame);
      const newGameMeta = new this.gameMetaModel({
        Game_id: newGame.id,
        name,
        keys,
        data_keys,
        screenshot_urls: screenshot_urls,
      });
      await newGameMeta.save();
      await this.queryRunnerProvider.releaseWithCommit();
    } catch (e) {
      await this.queryRunnerProvider.releaseWithRollback();
      throw new NotAllowedRequestException();
    }
    return 'OK';
  }

  async insertGameData(data: InsertDto[]) {
    for await (const d of data) {
      const game = await this.gameMetaModel
        .findOne({
          name: d.name,
        })
        .exec();
      if (!game) {
        throw new BadRequestException();
      }
      if (
        !Object.keys(d.data).every(k => game.keys.includes(k)) ||
        !game.keys.every(k => Object.keys(d.data).includes(k))
      ) {
        throw new BadRequestException();
      }

      const newGameData = new this.gameDataModel({
        Game_id: game.Game_id,
        data: d.data,
      });
      await newGameData.save();
    }
    return 'OK';
  }

  async purchaseGame(myId: number, gameId: number) {
    const game = await this.gameRepoistory.findById({ id: gameId }).catch(e => {
      throw new BadRequestException();
    });
    const user = await this.userRepository.findById({ id: myId }).catch(e => {
      throw new BadRequestException();
    });
    const { coin: usersCoinLeft } = await this.assetsRepositry
      .findOneOrFail({ where: { User_id: user.id } })
      .catch(_ => {
        throw new ForbiddenException();
      });
    const leftCoinAfterPurchasing = usersCoinLeft - game.price;
    const entityManager = await this.queryRunnerProvider.init();
    try {
      if (game.price > usersCoinLeft) {
        throw new NotAllowedRequestException();
      }
      await entityManager.update(
        Assets,
        { User_id: user.id },
        { coin: leftCoinAfterPurchasing },
      );

      const newCoinUseRecords = entityManager.create(CoinUseRecords, {
        used_coin: game.price,
        purchase_time: new Date(),
        User_id: user.id,
        remain_coin: leftCoinAfterPurchasing,
      });
      await entityManager.save(newCoinUseRecords);

      const newPurchaseRecords = entityManager.create(GamePurchaseRecords, {
        User_id: user.id,
        Game_id: game.id,
      });
      await entityManager
        .getRepository(GamePurchaseRecords)
        .save(newPurchaseRecords);
      await this.queryRunnerProvider.releaseWithCommit();
    } catch (e) {
      await this.queryRunnerProvider.releaseWithRollback();
      throw new InternalServerErrorException();
    }
    return 'OK';
  }

  async rateGame(myId: number, gameId: number, score: number) {
    const game = await this.gameRepoistory.findById({ id: gameId }).catch(e => {
      throw new BadRequestException();
    });
    await this.gameUtils.validGameOwnership(myId, game.id);
    const entityManager = await this.queryRunnerProvider.init();
    try {
      await this.gameRepoistory.saveRating({
        userId: myId,
        gameId: game.id,
        score,
        entityManager,
      });
      const [{ gameAVGScore }] = await entityManager.query(
        `SELECT AVG(score) as gameAVGScore from games_ratings where Game_id = ?`,
        [game.id],
      );
      const updatedRating = Number(Number(gameAVGScore).toFixed(2));

      await entityManager.update(
        Games,
        { id: game.id },
        { rating: updatedRating },
      );

      await this.queryRunnerProvider.releaseWithCommit();
      return updatedRating;
    } catch (e) {
      await this.queryRunnerProvider.releaseWithRollback();
      throw new InternalServerErrorException();
    }
  }

  async saveGame(myId: number, body: SaveGameDto) {
    const entityManager = await this.queryRunnerProvider.init();

    try {
      // alarm_id 받기
      const alarmResult = await this.alarmRepository
        .saveResult({
          start_time: body.start_time,
          end_time: body.end_time,
          Game_id: body.Game_id,
          data: body.data,
          is_cleared: body.is_cleared,
          Alarm_id: body.Alarm_id,
          entityManager,
        })
        .catch(e => {
          throw new BadRequestException();
        });

      await entityManager.getRepository(AlarmPlayRecords).save({
        User_id: myId,
        Alarm_result_id: alarmResult.id,
      });

      const savedData = await this.gameUtils.sanitizeData(
        body.Game_id,
        body.data.data,
      );
      await this.userPlayDataModel.updateOne(
        {
          User_id: myId,
          Game_id: body.Game_id,
        },
        {
          play_data: savedData,
          updated_at: new Date(),
        },
        { upsert: true },
      );
      await this.queryRunnerProvider.releaseWithCommit();
    } catch (e) {
      await this.queryRunnerProvider.releaseWithRollback();
      throw new InternalServerErrorException();
    }
    return 'OK';
  }

  async startGame(myId: number, alarmId: number, expiry?: number) {
    if (!alarmId) {
      return null;
    }
    const user = await this.userRepository.findById({ id: myId }).catch(_ => {
      throw new BadRequestException();
    });
    const alarm = await this.alarmRepository
      .findById({ id: alarmId })
      .catch(_ => {
        throw new BadRequestException();
      });

    const rtcToken = this.agoraService.generateRtcToken(
      String(alarm.id),
      'publisher',
      'uid',
      user.id,
      expiry,
    );

    const rtmToken = this.agoraService.generateRtmToken(
      String(user.id),
      expiry,
    );

    await this.dataSource
      .createQueryBuilder()
      .update(GameChannel)
      .set({ player_count: () => 'player_count + 1' })
      .where('Alarm_id = :id', { id: alarm.id })
      .andWhere('name = :name', { name: String(alarm.id) })
      .execute();

    const alarmMemberIds = await this.alarmMembersRepository.find({
      where: { Alarm_id: alarm.id },
      select: {
        User_id: true,
      },
    });
    const userIds = alarmMemberIds.map(m => m.User_id);
    const gameData = await this.gameUtils.getDataForGame(alarm.id);

    return {
      rtcToken,
      rtmToken,
      gameData,
      channelName: String(alarm.id),
      members: userIds.length,
      Game_id: alarm.Game_id,
    };
  }

  async readyForGame(alarmId: number) {
    const alarm = await this.alarmRepository
      .findById({ id: alarmId })
      .catch(_ => {
        throw new BadRequestException();
      });
    const members = await this.alarmUtils.getAlarmMembers({
      id: alarmId,
    });

    const userIds = members.map(m => m.id);
    await this.gameUtils.saveGameDataToCache(alarm.id, userIds);
    return 'OK';
  }
}
