import { BadRequestException, CACHE_MANAGER, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { AlarmPlayRecords } from 'src/entities/alarm.play.records.entity';
import { AlarmResults } from 'src/entities/alarm.results.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { Assets } from 'src/entities/assets.entity';
import { CoinUseRecords } from 'src/entities/coin.use.records.entity';
import { GamePlayImages } from 'src/entities/game-play.images.entity';
import { GamePlayKeywords } from 'src/entities/game-play.keywords.entity';
import { GameChannel } from 'src/entities/game.channel.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { GameUsedImages } from 'src/entities/game.used-images.entity';
import { Games } from 'src/entities/games.entity';
import { GamesRatings } from 'src/entities/games.ratings.entity';
import { GamesScreenshots } from 'src/entities/games.screenshots.entity';
import { Users } from 'src/entities/users.entity';
import { AgoraService } from 'src/external/agora/agora.service';
import { GameData, GameDataDocument } from 'src/schemas/gameData.schemas';
import { GameMeta } from 'src/schemas/gameMeta.schemas';
import { UserPlayData, UserPlayDataDocument } from 'src/schemas/userPlayData.schemas';
import { DataSource, Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { SaveGameDto } from './dto/save-game.dto';
import { GameKeywordImages } from './types/game-keyword-images.type';

type GameDetail = {
    game: Games;
    gameScreenshots: string[];
}

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(Games)
        private readonly gamesRepoistory: Repository<Games>,
        @InjectRepository(GamesScreenshots)
        private readonly gamesScreenRepository: Repository<GamesScreenshots>,
        @InjectRepository(GamePurchaseRecords)
        private readonly gamePurRepository: Repository<GamePurchaseRecords>,
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(Assets)
        private readonly assetsRepositry: Repository<Assets>,
        @InjectRepository(GamePlayKeywords)
        private readonly gamePlayKeywordsRepository: Repository<GamePlayKeywords>,
        @InjectRepository(GameUsedImages)
        private readonly gameUsedImagesRespotiroy: Repository<GameUsedImages>,
        @InjectRepository(GamePlayImages)
        private readonly gamePlayImagesRepository: Repository<GamePlayImages>,
        @InjectRepository(Alarms)
        private readonly alarmsRepository: Repository<Alarms>,
        @InjectRepository(AlarmMembers)
        private readonly alarmMembersRepository: Repository<AlarmMembers>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly agoraService: AgoraService,
        @InjectModel(GameData.name) private gameDataModel: Model<GameDataDocument>,
        @InjectModel(UserPlayData.name) private userPlayDataModel: Model<UserPlayDataDocument>,
        @InjectModel(GameMeta.name) private gameMetaModel: Model<GameMeta>,
        private dataSource: DataSource,

    ) {}

    private readonly AWS_S3_STATIC_IMAGE_URL=process.env.AWS_S3_STATIC_IMAGE_URL;
    async getAllGames(skip: number, take: number) {
        if (!skip || !take) {
            skip = 0;
            take = 100;    
        }
        return await this.gamesRepoistory.find({
            skip,
            take
        });
    }

    async getGameDetailsById(gameId: number): Promise<GameDetail> {
        const game = await this.getGameById(gameId);
        const gameScreenshots = await this.gamesScreenRepository.find({
            where: {
                Game_id: game.id
            },
            select: {
                screenshot_url: true,
            }
        });
        const sshotsReturning = gameScreenshots.map(s => s.screenshot_url);
        return {
            game,
            gameScreenshots: sshotsReturning
        };
    }

    async createNewGame(myId: number, body: CreateGameDto) {
        const { screenshot_urls, data_type, keys, ...bodyWithoutMeta } = body;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const newGame = await queryRunner.manager.getRepository(Games).save({
                ...bodyWithoutMeta
            });
            await queryRunner.commitTransaction();
            const newGameMeta = new this.gameMetaModel({
                Game_id: newGame.id,
                data_type: data_type,
                keys: keys,
                screenshot_urls: screenshot_urls
            });
            await newGameMeta.save();
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new ForbiddenException(e);
        } finally {
            await queryRunner.release();
        }
        return "OK";
    }

    //transaction
        // game 있는지 확인 
        // keyword 있는지 확인
        // 있으면 추가, 위에 아무거나 걸리면 exception
        // 추가할 거를 모아서 하게끔??
    async addGameImages(myId: number, gameId: number, gKI: GameKeywordImages) {
        
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.startTransaction();
        await queryRunner.connect();
        
        // game 있는지 확인 
        const game = await this.getGameById(gameId);
        // keyword 있는지 확인
        let gameKeyword = await this.gamePlayKeywordsRepository.findOne({ where: { keyword: gKI.keyword, Game_id: game.id }});
        if (!gameKeyword) {
            const newGPK = new GamePlayKeywords()
            newGPK.Game_id = game.id;
            newGPK.keyword = gKI.keyword;
            gameKeyword = await this.gamePlayKeywordsRepository.save(newGPK);
            await this.gamesRepoistory.createQueryBuilder()
                    .update(Games, { keyword_count: () => 'keyword_count + 1' })
                    .where('id = :id', { id: game.id })
                    .execute();
        }

        try {
            for await (let url of gKI.images)  {
                const newGPI = new GamePlayImages();
                newGPI.Keyword_id = gameKeyword.id;
                newGPI.url = url;
                await queryRunner.manager.getRepository(GamePlayImages).save(newGPI);
                await queryRunner.manager.getRepository(GamePlayKeywords).createQueryBuilder()
                    .update(GamePlayKeywords, { image_count: () => 'image_count + 1' })
                    .where('id = :id', { id: gameKeyword.id })
                    .execute();
            }
            await queryRunner.commitTransaction();
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new ForbiddenException();
        } finally {
            await queryRunner.release();
        }

        return 'OK';
    }
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
            const user = await this.usersRepository.findOneOrFail({ where: { id: myId }})
                                .catch(_ => { throw new ForbiddenException() });
            
            const { coin: usersCoinLeft } = await this.assetsRepositry.findOneOrFail({ where: { User_id: user.id }})
                                .catch(_ => { throw new ForbiddenException() });
            if (game.price > usersCoinLeft) {
                throw new ForbiddenException('Invalid Order');
            }
            const remainCoin = usersCoinLeft - game.price;
            await queryRunner.manager.getRepository(Assets).createQueryBuilder()
                        .update(Assets)
                        .set({ coin: remainCoin })
                        .where('User_id = :id', { id: user.id })
                        .execute();
                        
            const newCoinUseRecords = new CoinUseRecords();
            newCoinUseRecords.used_coin = game.price;
            newCoinUseRecords.purchase_time = new Date();
            newCoinUseRecords.User_id = user.id;
            newCoinUseRecords.remain_coin = remainCoin;
            await queryRunner.manager.getRepository(CoinUseRecords).save(newCoinUseRecords);

            await queryRunner.manager.getRepository(GamePurchaseRecords).save({
                User_id: user.id,
                Game_id: game.id
            });
            await queryRunner.commitTransaction();
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new ForbiddenException('Invalid Order');
        } finally {
            await queryRunner.release();
        }
        return 'OK';
    }
    private async getGameById(gameId: number) {
        return await this.gamesRepoistory.findOneOrFail({ where: { id: gameId }})
                            .catch(_ => { throw new NotFoundException('Game Not Found') });
    }

    private async getRandomKeyword(gameId: number, keywordCount: number) {
        const { id: randomKeywordId, keyword } = await this.gamePlayKeywordsRepository.createQueryBuilder('gpk')
                                .select([
                                    'gpk.id',
                                    'gpk.keyword'
                                ])
                                .innerJoin('gpk.Game', 'g', 'g.id = :gameId', { gameId })
                                .skip(Math.floor(Math.random() * keywordCount))
                                .take(1)
                                .getOne();
        return { randomKeywordId, keyword };    
    }
    async getImagesForGame(myId: number, gameId: number, except?: number) {
        const game = await this.getGameById(gameId);
        const keywordCount = game.keyword_count;
        console.log('[*] Keyword Count', keywordCount);
        let { randomKeywordId, keyword } = await this.getRandomKeyword(game.id, keywordCount);
        while(except && randomKeywordId === except) {
            const newKeyword = await this.getRandomKeyword(game.id, keywordCount);
            keyword = newKeyword.keyword;
            randomKeywordId = newKeyword.randomKeywordId; 
        }
        const imageCount = (await this.gamePlayKeywordsRepository
            .findOne({ where: { id: randomKeywordId }})).image_count;
        const selectedGPIs = await this.gamePlayImagesRepository.createQueryBuilder('gpi')
            .select([
                'gpi.id',
                'k.keyword',
                'gpi.url'
            ])
            .innerJoin('gpi.Keyword', 'k', 'k.id = :kId', { kId: randomKeywordId })
            .skip(Math.floor(Math.random() * (imageCount - 6)))
            .take(6)
            .getMany();
        return {
            randomKeywordId,
            keyword,
            selectedGPIs
        }
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
            const [ { gameAVGScore } ] = await queryRunner.manager.query(
                `SELECT AVG(score) as gameAVGScore from games_ratings where Game_id = ${game.id}`
            );
            console.log('[*] gameAvgSAcore: ', gameAVGScore);
            updatedRating = Number(Number(gameAVGScore).toFixed(2));
            await queryRunner.manager.getRepository(Games).createQueryBuilder('game')
                    .update()
                    .set({ rating: updatedRating })
                    .where("id = :id", { id: game.id })
                    .execute();
            await queryRunner.commitTransaction();
        } catch(e) {
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
            const alarmResult = await queryRunner.manager.getRepository(AlarmResults).save({
                start_time: body.start_time,
                end_time: body.end_time,
                Game_id: body.Game_id,
                data: body.data,
                Game_channel_id: body.Game_channel_id,
                is_cleared: body.is_cleared,
                Alarm_id: body.Alarm_id
            });
            await queryRunner.manager.getRepository(AlarmPlayRecords).save({
                User_id: myId,
                Alarm_result_id: alarmResult.id
            });
            await queryRunner.commitTransaction();
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new ForbiddenException();
        } finally {
            await queryRunner.release();    
        }
        await this.cacheManager.del(`${myId}_records_by_alarm`);
        return 'OK';
    }

    async startGame(myId: number, alarmId: number, expiry?: number) {
        if (!alarmId) {
            return null;
        }
        const user = await this.usersRepository.findOneOrFail({ where: { id: myId }})
                            .catch(_ => { throw new ForbiddenException() });
        const alarm = await this.alarmsRepository.findOneOrFail({ where: { id: alarmId }})
                            .catch(_ => { throw new ForbiddenException() });
        const rtcToken = this.agoraService.generateRtcToken(String(alarm.id), 'publisher', 'uid', user.id, expiry);
        const rtmToken = this.agoraService.generateRtmToken(String(user.id), expiry);
        await this.dataSource.createQueryBuilder()
            .update(GameChannel)
            .set({ player_count: () => 'player_count + 1'})
            .where('Alarm_id = :id', { id: alarm.id })
            .andWhere('name = :name', { name: String(alarm.id) })
            .execute();

        let gameData = await this.cacheManager.get(`alarm-${alarm.id}-game-data`);
        if (!gameData) {
            const alarmMemberIds = await this.alarmMembersRepository.find({
                where: { Alarm_id: alarm.id },
                select: {
                    User_id: true
                }
            });
            const userIds = alarmMemberIds.map(m => m.User_id);
            gameData = await this.readyForGame(alarm.Game_id, userIds, alarm.data);
                    
        }
        const images = await this.gameUsedImagesRespotiroy.createQueryBuilder('gui')
                .select([
                    'gui.keyword',
                    'gpi.url'
                ])
                .innerJoin('gui.Game_play_image', 'gpi')
                .innerJoin('gpi.Keyword', 'k')
                .where('gui.Game_channel_id = :id', { id: alarm.id })
                .getMany();
        const images1 = images.slice(0,6);
        const player1Keyword = images1[0].keyword;
        const player1Images = images1.map(i => i.Game_play_image.url);
        const player1AnswerIndex = 3;

        const images2 = images.slice(6);
        const player2Keyword = images2[0].keyword;
        const player2Images = images2.map(i => i.Game_play_image.url);
        const player2AnswerIndex = 2;
        
        return {
            rtcToken,
            rtmToken,
            player1Keyword,
            player1Images,
            player1AnswerIndex,
            player2Keyword,
            player2Images,
            player2AnswerIndex,
            channelName: String(alarm.id),
            Game_id: alarm.Game_id
        };
    }
    private async checkToOwnGame(myId: number, gameId: number) {
        return await this.gamePurRepository.createQueryBuilder('gpr')
        .innerJoin('gpr.Game', 'g', 'g.id = :gameId', { gameId })
        .innerJoin('gpr.User', 'u', 'u.id = :myId', { myId })
        .getOne();
    }

    async readyForGame(alarmId: number, userIds: number[], data?: object) {
        const { Game_id } = await this.alarmsRepository.findOne({
            where: { id: alarmId },
            select: {
                Game_id: true
            }
        });
        let gameDataForAlarm;
        let dataForGame;
        switch(Game_id) {
            case 1:
                dataForGame = await this.prepareGame1(Game_id, userIds);
                break
            case 2:
                dataForGame = await this.gameDataModel.find({
                    Game_id,
                }, { data: true }).exec();
                const titles = dataForGame.map(d => d.data['title']);
                if (!titles.includes(data['title'])) {
                    throw new BadRequestException('Invalid Title');
                }
                gameDataForAlarm = await this.prepareGame2(Game_id, data['title'], userIds);
                break
            default:
                throw new BadRequestException('Invalid GameId');
                break
        }
        return gameDataForAlarm;

    }

    async prepareGame1(gameId: number, userIds: number[]) {
        const indexCandidates = [0, 1, 2, 3, 4, 5 ,6 ,7 ,8 ,9];

        const gameDatas = await this.gameDataModel.aggregate([
            { $match: { Game_id: gameId }},
            { $sample: { size: userIds.length }},
            { $project: { data: true }}
        ]).exec();

        const dataForGame = gameDatas.map((d, idx) => { 
            const randImgIndices = this.getRandomSubarray(indexCandidates, 6);
            const answerIndex = Math.floor(Math.random() * randImgIndices.length)
            const images: string[] = randImgIndices.map((i :number)=> `${this.AWS_S3_STATIC_IMAGE_URL}/${d['data']['keyword']}/${d['data']['keyword']}${i}.jpg`);
            return { User_id: userIds[idx], keyword: d['data']['keyword'], images, answerIndex };
        });

        return dataForGame;

    } 

    private async prepareGame2(gameId: number, title: string, userIds: number[]) {
        let dataForGame = [];
        const { data } = await this.gameDataModel.findOne({
            $and: [
                { Game_id: gameId }, { "data.title": title }
            ]
        }, { data: true }).exec();
        for await (let User_id of userIds) {
            const { play_data } = await this.userPlayDataModel.findOne({
                User_id
            }).exec();
            const next_read: number = play_data['next_read'][title] ? play_data['next_read'][title] : 1;
            const contents = data['paragraphs'].filter(p => p.paragraph_idx == next_read);
            const dataForUser = {
                User_id,
                contents
            }
            dataForGame = [ dataForUser, ...dataForGame ];
        }
        return dataForGame;
    }
    private getRandomSubarray(arr, size) {
        var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
        while (i-- > min) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(min);
    }

}
