import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assets } from 'src/entities/assets.entity';
import { CoinUseRecords } from 'src/entities/coin.use.records.entity';
import { GamePlayImages } from 'src/entities/game-play.images.entity';
import { GamePlayKeywords } from 'src/entities/game-play.keywords.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { Games } from 'src/entities/games.entity';
import { GamesScreenshots } from 'src/entities/games.screenshots.entity';
import { Users } from 'src/entities/users.entity';
import { DataSource, Repository } from 'typeorm';
import { GameKeywordImages } from './types/game-keyword-images.type';

type GameDetail = {
    game: Games;
    gameScreenshots: GamesScreenshots[];
    is_owned: boolean;
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
        const is_owned = Boolean(await this.gamePurRepository.createQueryBuilder('gpr')
                                .innerJoin('gpr.Game', 'g', 'g.id = :gameId', { gameId })
                                .innerJoin('gpr.User', 'u', 'u.id = :myId', { myId })
                                .getOne());
        return {
            game,
            gameScreenshots,
            is_owned
        };
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

        try {
            // game 있는지 확인 
            const game = await this.getGameById(gameId);
            // keyword 있는지 확인
            const gameKeyword = await this.gamePlayKeywordsRepository.findOneOrFail({ where: { keyword: gKI.keyword, Game_id: gameId }})
                                        .catch(_ => { throw new ForbiddenException() });
            
            for await (let url of gKI.images)  {
                const newGPI = new GamePlayImages();
                newGPI.Keyword_id = gameKeyword.id;
                newGPI.url = url;
                
                await queryRunner.manager.getRepository(GamePlayImages).save(newGPI);
            }
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
            await this.assetsRepositry.createQueryBuilder()
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

}
