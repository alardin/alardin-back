import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { AlarmPlayRecords } from 'src/entities/alarm.play.records.entity';
import { AlarmResults } from 'src/entities/alarm.results.entity';
import { Assets } from 'src/entities/assets.entity';
import { CoinUseRecords } from 'src/entities/coin.use.records.entity';
import { GamePlayImages } from 'src/entities/game-play.images.entity';
import { GamePlayKeywords } from 'src/entities/game-play.keywords.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { Games } from 'src/entities/games.entity';
import { GamesRatings } from 'src/entities/games.ratings.entity';
import { GamesScreenshots } from 'src/entities/games.screenshots.entity';
import { Users } from 'src/entities/users.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { SaveGameDto } from './dto/save-game.dto';
import { GameKeywordImages } from './types/game-keyword-images.type';

type GameDetail = {
    game: Games;
    gameScreenshots: GamesScreenshots[];
    isOwned: boolean;
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
        @InjectRepository(GamePlayImages)
        private readonly gamePlayImagesRepository: Repository<GamePlayImages>,
        @InjectRepository(GamesRatings)
        private readonly gamesRatingsRepository: Repository<GamesRatings>,
        @InjectRepository(AlarmMembers)
        private readonly alarmMembersRepository: Repository<AlarmMembers>,
        private dataSource: DataSource,

    ) {}

    async getAllGames(skip: number, take: number) {
        return await this.gamesRepoistory.find({
            skip,
            take
        });
    }

    async getGameDetailsById(myId: number, gameId: number): Promise<GameDetail> {
        const game = await this.getGameById(gameId);
        const gameScreenshots = await this.gamesScreenRepository.find({
            where: {
                Game_id: game.id
            }
        });
        const isOwned = Boolean(await this.checkToOwnGame(myId, game.id));
        return {
            game,
            gameScreenshots,
            isOwned
        };
    }

    async createNewGame(myId: number, body: CreateGameDto) {
        const { screenshot_urls, ...bodyWithoutScreenshots } = body;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const newGame = await queryRunner.manager.getRepository(Games).save({
                ...bodyWithoutScreenshots
            });
            for await (let url of screenshot_urls) {
                await queryRunner.manager.getRepository(GamesScreenshots).save({
                    Game_id: newGame.id,
                    screenshot_url: url
                });
            }
           await queryRunner.commitTransaction();
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new ForbiddenException();
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

    async getImagesForGame(myId: number, gameId: number): Promise<GamePlayImages[]> {
        const game = await this.getGameById(gameId);
        const keywordCount = game.keyword_count;

        const [ { gpk_id: randomKeywordId }] = await this.gamePlayKeywordsRepository.createQueryBuilder('gpk')
                                .select('gpk.id')
                                .innerJoin('gpk.Game', 'g', 'g.id = :gameId', { gameId: game.id })
                                .skip(Math.floor(Math.random() * keywordCount))
                                .limit(1)
                                .execute();
        const imageCount = (await this.gamePlayKeywordsRepository
                                .findOne({ where: { id: randomKeywordId }})).image_count;
        const selectedGPIs = await this.gamePlayImagesRepository.createQueryBuilder('gpi')
                                .select('gpi.*')
                                .innerJoin('gpi.Keyword', 'k', 'k.id = :kId', { kId: randomKeywordId })
                                .skip(Math.floor(Math.random() * (imageCount - 6)))
                                .limit(6)
                                .getMany();
        return selectedGPIs;
    }

    async rateGame(myId: number, gameId: number, score: number) {
        let updatedRating; 
        const game = await this.getGameById(gameId);
        await this.checkToOwnGame(myId, game.id);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const newRating = await queryRunner.manager.getRepository(GamesRatings).save({
                Game_id: game.id,
                score,
            });
            const [gameAVGScore] = await queryRunner.manager.getRepository(GamesRatings)
                                    .createQueryBuilder('gr')
                                    .select("AVG(gr.score)", 'gameAVGScore')
                                    .where('gr.Game_id = :id', {id: game.id})
                                    .getRawOne();
            updatedRating = gameAVGScore;
            await queryRunner.manager.getRepository(Games).createQueryBuilder('game')
                    .update()
                    .set({ rating: gameAVGScore })
                    .where("id = :id", { id: game.id })
                    .execute();
            await queryRunner.commitTransaction();
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new ForbiddenException();
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
            const alarmResult = await queryRunner.manager.getRepository(AlarmResults).save({
                start_time: body.start_time,
                end_time: body.end_time,
                trial: body.trial,
                Game_id: body.Game_id,
                is_bot_used: body.is_bot_used,
                is_cleared: body.is_cleared
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
        return 'OK';
    }

    async startGame(myId: number, alarmId: number) {
        const alarmMembers = await this.alarmMembersRepository.find({
            where: {
                Alarm_id: alarmId
            },
            relations: {
                User: true
            }
        });
        console.log(alarmMembers)
        return 'hi'
        // send push to member
        // generate image per user

    }
    private async checkToOwnGame(myId: number, gameId: number) {
        return await this.gamePurRepository.createQueryBuilder('gpr')
        .innerJoin('gpr.Game', 'g', 'g.id = :gameId', { gameId })
        .innerJoin('gpr.User', 'u', 'u.id = :myId', { myId })
        .getOne();
    }
}
