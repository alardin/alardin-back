import {
  BadRequestException,
  CACHE_MANAGER,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { AlarmService } from 'src/alarm/alarm.service';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { AlarmPlayRecords } from 'src/entities/alarm.play.records.entity';
import { AlarmResults } from 'src/entities/alarm.results.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { Assets } from 'src/entities/assets.entity';
import { CoinUseRecords } from 'src/entities/coin.use.records.entity';
import { GameChannel } from 'src/entities/game.channel.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { Games } from 'src/entities/games.entity';
import { GamesRatings } from 'src/entities/games.ratings.entity';
import { Users } from 'src/entities/users.entity';
import { AgoraService } from 'src/external/agora/agora.service';
import { GameData, GameDataDocument } from 'src/schemas/gameData.schemas';
import { GameMeta } from 'src/schemas/gameMeta.schemas';
import {
  UserPlayData,
  UserPlayDataDocument,
} from 'src/schemas/userPlayData.schemas';
import { DataSource, Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { InsertDto } from './dto/insert.dto';
import { SaveGameDto } from './dto/save-game.dto';

type GameDetail = {
  game: Games;
  gameScreenshots: string[];
};

@Injectable()
export class GameService {
  constructor(
    private readonly alarmService: AlarmService,
    @InjectRepository(Games)
    private readonly gamesRepoistory: Repository<Games>,
    @InjectRepository(GamePurchaseRecords)
    private readonly gamePurRepository: Repository<GamePurchaseRecords>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Assets)
    private readonly assetsRepositry: Repository<Assets>,
    @InjectRepository(Alarms)
    private readonly alarmsRepository: Repository<Alarms>,
    @InjectRepository(AlarmMembers)
    private readonly alarmMembersRepository: Repository<AlarmMembers>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly agoraService: AgoraService,
    @InjectModel(GameData.name) private gameDataModel: Model<GameDataDocument>,
    @InjectModel(UserPlayData.name)
    private userPlayDataModel: Model<UserPlayDataDocument>,
    @InjectModel(GameMeta.name) private gameMetaModel: Model<GameMeta>,
    private dataSource: DataSource,
    @Inject(Logger) private readonly logger: LoggerService
  ) {}

  private readonly AWS_S3_STATIC_IMAGE_URL =
    process.env.AWS_S3_STATIC_IMAGE_URL;
  async getAllGames(skip: number, take: number) {
    if (!skip || !take) {
      skip = 0;
      take = 100;
    }
    return await this.gamesRepoistory.find({
      skip,
      take,
    });
  }

  async getGameDetailsById(gameId: number): Promise<GameDetail> {
    const game = await this.getGameById(gameId);
    const gameMeta = await this.gameMetaModel
      .findOne({
        Game_id: game.id,
      })
      .exec();
    // mongodb에서 screenshots 가져오기
    return {
      game,
      gameScreenshots: gameMeta.screenshot_urls,
    };
  }

  async createNewGame(body: CreateGameDto) {
    const { screenshot_urls, keys, name, data_keys, ...bodyWithoutMeta } = body;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newGame = await queryRunner.manager.getRepository(Games).save({
        name, 
        ...bodyWithoutMeta,
      });
      const newGameMeta = new this.gameMetaModel({
        Game_id: newGame.id,
        name,
        keys,
        data_keys,
        screenshot_urls: screenshot_urls,
      });
      await newGameMeta.save();
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new ForbiddenException(e);
    } finally {
      await queryRunner.release();
    }
    return 'OK';
  }

  async insertGameData(data: InsertDto[]) {
        for await (let d of data) {
            const game = await this.gameMetaModel.findOne({
                name: d.name
            }).exec();
            if (!game) {
                throw new BadRequestException('Invalid Game_id');
            }
            if ( !Object.keys(d.data).every((k) => game.keys.includes(k)) || !game.keys.every((k) => Object.keys(d.data).includes(k))) {
                throw new BadRequestException('Invalid keys');
            }

            const newGameData = new this.gameDataModel({
                Game_id: game.Game_id,
                data: d.data
            });
            await newGameData.save();
        }
        return 'OK';
  }

  //transaction
  // game 있는지 확인
  // keyword 있는지 확인
  // 있으면 추가, 위에 아무거나 걸리면 exception
  // 추가할 거를 모아서 하게끔??
  async purchaseGame(myId: number, gameId: number) {
    // transaction
    // 살 수 있는지 확인
    // 사용자 코인 감소
    // 코인 사용 기록 추가
    // 구매 기록 추가
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const game = await this.getGameById(gameId);
      const user = await this.usersRepository
        .findOneOrFail({ where: { id: myId } })
        .catch((_) => {
          throw new ForbiddenException();
        });

      const { coin: usersCoinLeft } = await this.assetsRepositry
        .findOneOrFail({ where: { User_id: user.id } })
        .catch((_) => {
          throw new ForbiddenException();
        });
      if (game.price > usersCoinLeft) {
        throw new ForbiddenException('Invalid Order');
      }
      const remainCoin = usersCoinLeft - game.price;
      await queryRunner.manager
        .getRepository(Assets)
        .createQueryBuilder()
        .update(Assets)
        .set({ coin: remainCoin })
        .where('User_id = :id', { id: user.id })
        .execute();

      const newCoinUseRecords = new CoinUseRecords();
      newCoinUseRecords.used_coin = game.price;
      newCoinUseRecords.purchase_time = new Date();
      newCoinUseRecords.User_id = user.id;
      newCoinUseRecords.remain_coin = remainCoin;
      await queryRunner.manager
        .getRepository(CoinUseRecords)
        .save(newCoinUseRecords);

      await queryRunner.manager.getRepository(GamePurchaseRecords).save({
        User_id: user.id,
        Game_id: game.id,
      });
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new ForbiddenException('Invalid Order');
    } finally {
      await queryRunner.release();
    }
    return 'OK';
  }
  private async getGameById(gameId: number) {
    return await this.gamesRepoistory
      .findOneOrFail({ where: { id: gameId } })
      .catch((_) => {
        throw new NotFoundException('Game Not Found');
      });
  }

  async rateGame(myId: number, gameId: number, score: number) {
    let updatedRating: number | undefined;
    const game = await this.getGameById(gameId);
    await this.checkToOwnGame(myId, game.id);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.getRepository(GamesRatings).save({
        Game_id: game.id,
        User_id: myId,
        score,
      });
      const [{ gameAVGScore }] = await queryRunner.manager.query(
        `SELECT AVG(score) as gameAVGScore from games_ratings where Game_id = ${game.id}`,
      );
      console.log('[*] gameAvgSAcore: ', gameAVGScore);
      updatedRating = Number(Number(gameAVGScore).toFixed(2));
      await queryRunner.manager
        .getRepository(Games)
        .createQueryBuilder('game')
        .update()
        .set({ rating: updatedRating })
        .where('id = :id', { id: game.id })
        .execute();
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new ForbiddenException(e);
    } finally {
      await queryRunner.release();
    }
    return updatedRating;
  }
  // alarm results 저장
  // alarm play record 추가
  async saveGame(myId: number, body: SaveGameDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // alarm_id 받기
      const alarmResult = await queryRunner.manager
        .getRepository(AlarmResults)
        .save({
          start_time: body.start_time,
          end_time: body.end_time,
          Game_id: body.Game_id,
          data: body.data,
          is_cleared: body.is_cleared,
          Alarm_id: body.Alarm_id,
        });
      await queryRunner.manager.getRepository(AlarmPlayRecords).save({
        User_id: myId,
        Alarm_result_id: alarmResult.id,
      });

      const savedData = await this.sanitizeData(body.Game_id, body.data.data);
      await this.userPlayDataModel.updateOne(
        {
          User_id: myId,
          Game_id: body.Game_id,
        }, {
          play_data: savedData,
          updated_at: new Date()
        }, { upsert: true }
      );
      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);
      await queryRunner.rollbackTransaction();
      throw new ForbiddenException();
    } finally {
      await queryRunner.release();
    }
    return 'OK';
  }

  async startGame(myId: number, alarmId: number, expiry?: number) {
    if (!alarmId) {
      return null;
    }
    const user = await this.usersRepository
      .findOneOrFail({ where: { id: myId } })
      .catch((_) => {
        throw new ForbiddenException();
      });
    const alarm = await this.alarmsRepository
      .findOneOrFail({ where: { id: alarmId } })
      .catch((_) => {
        throw new ForbiddenException();
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

    let gameData = await this.cacheManager.get(`alarm-${alarm.id}-game-data`);
    
    if (!gameData) {
      const alarmMemberIds = await this.alarmMembersRepository.find({
        where: { Alarm_id: alarm.id },
        select: {
          User_id: true,
        },
      });
      const userIds = alarmMemberIds.map((m) => m.User_id);
      gameData = await this.readyForGame(alarm.id, userIds);
      await this.cacheManager.set(`alarm-${alarm.id}-game-data`, gameData, { ttl: 60 * 10 });
    } else {
      this.logger.log('Hit Game Cache!')
      this.logger.log(gameData);
    }

    await this.alarmService.clearAlarmsCache(myId);

    return {
      rtcToken,
      rtmToken,
      gameData,
      channelName: String(alarm.id),
      Game_id: alarm.Game_id,
    };
  }
  private async checkToOwnGame(myId: number, gameId: number) {
    return await this.gamePurRepository
      .createQueryBuilder('gpr')
      .innerJoin('gpr.Game', 'g', 'g.id = :gameId', { gameId })
      .innerJoin('gpr.User', 'u', 'u.id = :myId', { myId })
      .getOne();
  }

  async readyForGame(alarmId: number, userIds: number[]) {
    const { Game_id } = await this.alarmsRepository.findOne({
      where: { id: alarmId },
      select: {
        Game_id: true,
      },
    });
    let gameDataForAlarm;
    switch (Game_id) {
      case 1:
        gameDataForAlarm = await this.prepareGame1(Game_id, userIds);
        break;
      case 2:
        const [ dataForGame ] = await this.gameDataModel
          .find(
            {
              Game_id,
            },
            { data: true },
          )
          .exec();
        gameDataForAlarm = await this.prepareTextGame(
          Game_id,
          dataForGame.data['title'],
          userIds,
        );
        case 3:
          gameDataForAlarm = await this.prepareGame3(1, userIds);
          break;
      default:
        throw new BadRequestException('Invalid GameId');
    }
    return gameDataForAlarm;
  }

  async prepareGame1(gameId: number, userIds: number[]) {
    const indexCandidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    const gameDatas = await this.gameDataModel
      .aggregate([
        { $match: { Game_id: gameId } },
        { $sample: { size: userIds.length } },
        { $project: { data: true } },
      ])
      .exec();

    const dataForGame = gameDatas.map((d, idx) => {
      const randImgIndices = this.getRandomSubarray(indexCandidates, 6);
      const answerIndex = Math.floor(Math.random() * randImgIndices.length);
      const images: string[] = randImgIndices.map(
        (i: number) =>
          `${this.AWS_S3_STATIC_IMAGE_URL}/${d['data']['keyword']}/${d['data']['keyword']}${i}.jpg`,
      );
      return {
        User_id: userIds[idx],
        keyword: d['data']['keyword'],
        images,
        answerIndex,
      };
    });
    
    return dataForGame;
  }

  private async prepareTextGame(gameId: number, title: string, userIds: number[]) {
    let dataForGame = [];
    const { data } = await this.gameDataModel
      .findOne(
        {
          $and: [{ Game_id: gameId }, { 'data.title': title }],
        },
        { data: true },
      )
      .exec();
    for await (let User_id of userIds) {
      const { play_data } = await this.userPlayDataModel
        .findOne({
          $and: [ { User_id }, { Game_id: gameId } ]
        })
        .exec();
      const next_read: number = play_data['next_read']
        ? play_data['next_read']
        : 1;
      const contents = data['paragraphs'].filter(
        (p) => p.paragraph_idx == next_read,
      );
      const dataForUser = {
        User_id,
        contents,
      };
      dataForGame = [dataForUser, ...dataForGame];
    }
    return dataForGame;
  }

  async prepareGame3(gameId:number, userIds: number[]) {
    const indexCandidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    const [ gameDatas ] = await this.gameDataModel
      .aggregate([
        { $match: { Game_id: gameId } },
        { $sample: { size: 1 } },
        { $project: { data: true } },
      ])
      .exec();
    const randImgIndices = this.getRandomSubarray(indexCandidates, 6);
    const answerIndex = Math.floor(Math.random() * randImgIndices.length);
    const images: string[] = randImgIndices.map(
      (i: number) =>
        `${this.AWS_S3_STATIC_IMAGE_URL}/${gameDatas['data']['keyword']}/${gameDatas['data']['keyword']}${i}.jpg`,
    );
    const dataForGame = userIds.map((id) => {
      return {
        User_id: id,
        keyword: gameDatas['data']['keyword'],
        images,
        answerIndex,
      };
    });
    return dataForGame;
  }
  private getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0),
      i = arr.length,
      min = i - size,
      temp,
      index;
    while (i-- > min) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
    return shuffled.slice(min);
  }

  private async sanitizeData(gameId: number, data: object) {
    // const GAME_KEYS = {
    //   1: ['is_cleared'],
    //   2: ['next_read'],
    //   3: ['is_cleared']
    // };
    let GAME_KEYS: string[];
    try {
      const { data_keys } = await this.gameMetaModel.findOne({ Game_id: gameId }).exec();
      GAME_KEYS = data_keys
    } catch(e) {
      throw new BadRequestException('Invalid Request');
    }
    let returnData = {}
    for (let key of GAME_KEYS) {
      if (data[key]) {
        returnData = { key: data[key], ...returnData }
      }
    }
    return returnData;

  }
}
