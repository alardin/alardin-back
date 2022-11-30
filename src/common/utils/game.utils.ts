import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { AlarmRepository } from 'src/common/repository/alarm.repository';
import { GameData, GameDataDocument } from 'src/schemas/gameData.schemas';
import { GameMeta, GameMetaDocument } from 'src/schemas/gameMeta.schemas';
import {
  UserPlayData,
  UserPlayDataDocument,
} from 'src/schemas/userPlayData.schemas';
import { GameRepository } from '../repository/game.repository';
import {
  FindCarolData,
  ManyFestData,
  PicokeData,
  TGameData,
} from '../../game/game.types';

@Injectable()
export class GameUtils {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly alarmRepository: AlarmRepository,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectModel(GameData.name)
    private readonly gameDataModel: Model<GameDataDocument>,
    @InjectModel(GameMeta.name) private gameMetaModel: Model<GameMetaDocument>,
    @InjectModel(UserPlayData.name)
    private userPlayDataModel: Model<UserPlayDataDocument>,
  ) {}

  private readonly AWS_S3_STATIC_IMAGE_URL = this.config.get(
    'AWS_S3_STATIC_IMAGE_URL',
  );

  getRandomSubarray(arr: any[], size: number) {
    const shuffled = arr.slice(0);
    let i = arr.length;
    const min = i - size;
    let temp: number;
    let index: number;
    while (i-- > min) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
    return shuffled.slice(min);
  }

  async sanitizeData(gameId: number, data: object) {
    // const GAME_KEYS = {
    //   1: ['is_cleared'],
    //   2: ['next_read'],
    //   3: ['is_cleared']
    // };
    let GAME_KEYS: string[];
    try {
      const { data_keys } = await this.gameMetaModel
        .findOne({ Game_id: gameId })
        .exec();
      GAME_KEYS = data_keys;
    } catch (e) {
      throw new BadRequestException('Invalid Request');
    }
    let returnData = {};
    for (const key of GAME_KEYS) {
      if (data[key]) {
        returnData = { key: data[key], ...returnData };
      }
    }
    return returnData;
  }

  async validGameOwnership(userId: number, gameId: number) {
    const isOwned = await this.gameRepository.findPurchasedGame({
      userId,
      gameId,
    });
    return Boolean(isOwned);
  }

  async getDataForGame(alarmId: number) {
    return this.cacheManager.get<TGameData>(`${alarmId}_game_data`);
  }

  async saveGameDataToCache(alarmId: number, userIds: number[]) {
    let gameData = await this.getDataForGame(alarmId);
    if (gameData != null) {
      return;
    }
    const { Game_id } = await this.alarmRepository.findOne({
      where: { id: alarmId },
      select: {
        Game_id: true,
      },
    });
    let gameDataForAlarm: TGameData;
    switch (Game_id) {
      case 1:
        gameDataForAlarm = await this.prepareGamePicoke(Game_id, userIds);
        break;
      case 2:
        gameDataForAlarm = await this.prepareGameDeleteRow(1, userIds);
        break;
      case 3:
        const [dataForGame] = await this.gameDataModel
          .find(
            {
              Game_id,
            },
            { data: true },
          )
          .exec();
        gameDataForAlarm = await this.prepareGameFindCarol(
          Game_id,
          dataForGame.data['title'],
          userIds,
        );
        break;
      case 5:
        gameDataForAlarm = await this.prepareGameManyfest(1, userIds);
        break;
      default:
        throw new BadRequestException('Invalid GameId');
    }
    await this.cacheManager
      .set<TGameData>(`${alarmId}_game_data`, gameDataForAlarm, 60 * 10)
      .catch(e => {
        throw new InternalServerErrorException();
      });
    return;
  }

  async prepareGamePicoke(
    gameId: number,
    userIds: number[],
  ): Promise<PicokeData[]> {
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

  async prepareGameFindCarol(
    gameId: number,
    title: string,
    userIds: number[],
  ): Promise<FindCarolData[]> {
    let dataForGame = [];
    const { data } = await this.gameDataModel
      .findOne(
        {
          $and: [{ Game_id: gameId }, { 'data.title': title }],
        },
        { data: true },
      )
      .exec();
    for await (const User_id of userIds) {
      const playData = await this.userPlayDataModel
        .findOne({
          $and: [{ User_id }, { Game_id: gameId }],
        })
        .exec();
      const next_read =
        playData && playData.play_data['next_read']
          ? playData.play_data['next_read']
          : 1;
      const contents = data['paragraphs'].filter(
        p => p.paragraph_idx == next_read,
      );
      const dataForUser = {
        User_id,
        contents,
      };
      dataForGame = [dataForUser, ...dataForGame];
    }
    return dataForGame;
  }

  async prepareGameDeleteRow(
    gameId: number,
    userIds: number[],
  ): Promise<PicokeData[]> {
    const indexCandidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    const [gameDatas] = await this.gameDataModel
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
    const dataForGame = userIds.map(id => {
      return {
        User_id: id,
        keyword: gameDatas['data']['keyword'],
        images,
        answerIndex,
      };
    });
    return dataForGame;
  }

  async prepareGameManyfest(
    gameId: number,
    userIds: number[],
  ): Promise<ManyFestData[]> {
    const indexCandidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    const [gameDatas] = await this.gameDataModel
      .aggregate([
        { $match: { Game_id: gameId } },
        { $sample: { size: 1 } },
        { $project: { data: true } },
      ])
      .exec();
    const randImgIndices = this.getRandomSubarray(indexCandidates, 6);
    const images: string[] = randImgIndices.map(
      (i: number) =>
        `${this.AWS_S3_STATIC_IMAGE_URL}/${gameDatas['data']['keyword']}/${gameDatas['data']['keyword']}${i}.jpg`,
    );

    const dataForGame = userIds.map(id => {
      return {
        User_id: id,
        users: userIds,
        images,
        totalUsers: userIds.length,
      };
    });

    return dataForGame;
  }
}
