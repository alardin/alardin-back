import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Alarms } from "./alarms.entity";
import { GamePlayKeywords } from './game-play.keywords.entity';
import { GamePurchaseRecords } from "./game.purchase.records.entity";
import { GamesRatings } from "./games.ratings.entity";
import { GamesScreenshots } from "./games.screenshots.entity";
import { Users } from "./users.entity";

@Entity({ schema: 'alardin', name: 'games' })
export class Games {
    @ApiProperty({
        name: 'id',
        example: 1
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        name: 'name',
        example: '스페이스 크루'
    })
    @Column({ name: 'name' })
    name: string;

    @ApiProperty({
        name: 'category',
        example: '1234'
    })
    @Column({ name: 'category'})
    category: string;

    @ApiProperty({
        name: 'price',
        example: 200
    })
    @Column({ name: 'price' })
    price: number;

    @ApiProperty({
        name: 'description',
        example: '더 마인드에 스컬킹이 합쳐진 협동 트릭 테이킹 게임'
    })
    @Column({ name: 'description', default: '' })
    description: string;

    @ApiProperty({
        name: 'thumbnail_url',
        example:'https://cdn.kakao.com/img/20220723_afienfadf_168082023.jpg'
    })
    @Column({ name: 'thumbnail_url', nullable: true })
    thumbnail_url: string | null;

    @Column('int', { name: 'keyword_count', default: 0 })
    keyword_count: number;

    @ApiProperty({
        name: 'rating',
        example: 3.5
    })
    @Column('int', { name: 'rating', default: 0 })
    rating: number;

    @Column('int', { name: 'min_player', nullable: true })
    min_player: number | null;

    @Column('int', { name: 'max_player', nullable: true })
    max_player: number | null;

    @OneToMany(() => GamesScreenshots, gamesScreenshots => gamesScreenshots.Game)
    Games_screenshots: GamesScreenshots[];

    @OneToMany(() => GamesRatings, gamesRatings => gamesRatings.Game)
    Games_ratings: GamesRatings[];

    @OneToMany(() => Alarms, alarms => alarms.Game)
    Alarms: Alarms[];

    @OneToMany(() => GamePurchaseRecords, gamePurchaseRecords => gamePurchaseRecords.Game)
    Game_purchase_records: GamePurchaseRecords[];

    @ManyToMany(() => Users, users => users.Purchased_games)
    Purchasers: Users[];

    @OneToMany(_ => GamePlayKeywords, gamePlayKeywords => gamePlayKeywords.Game)
    Game_play_keywords: GamePlayKeywords[];

}