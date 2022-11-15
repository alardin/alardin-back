import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { IsMatchWithRegex } from 'src/common/decorators/match.validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AlarmResults } from './alarm.results.entity';
import { Alarms } from './alarms.entity';
import { GamePurchaseRecords } from './game.purchase.records.entity';
import { GamesRatings } from './games.ratings.entity';
import { Users } from './users.entity';

@Entity({ schema: 'alardin', name: 'games' })
export class Games {
  @ApiProperty({
    name: 'id',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    name: 'name',
    example: '스페이스 크루',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ name: 'name' })
  name: string;

  @ApiProperty({
    name: 'category',
    example: 'image | text',
  })
  @IsNotEmpty()
  @IsMatchWithRegex(/image|text/)
  @Column({ name: 'category' })
  category: string;

  @ApiProperty({
    name: 'price',
    example: 200,
  })
  @IsNumber()
  @IsNotEmpty()
  @Column({ name: 'price' })
  price: number;

  @ApiProperty({
    name: 'description',
    example: '더 마인드에 스컬킹이 합쳐진 협동 트릭 테이킹 게임',
  })
  @IsString()
  @MaxLength(500)
  @Column({ name: 'description', default: '', length: 500 })
  description: string;

  @ApiProperty({
    name: 'thumbnail_url',
    example: 'https://cdn.kakao.com/img/20220723_afienfadf_168082023.jpg',
  })
  @IsUrl()
  @IsNotEmpty()
  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnail_url: string | null;

  @ApiProperty({
    name: 'rating',
    example: 3.5,
  })
  @IsNumber()
  @Column('int', { name: 'rating', default: 0 })
  rating: number;

  @ApiProperty({
    name: 'min_player',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Column('int', { name: 'min_player', nullable: true })
  min_player: number | null;

  @ApiProperty({
    name: 'max_player',
    example: 4,
  })
  @IsInt()
  @IsNotEmpty()
  @Column('int', { name: 'max_player', nullable: true })
  max_player: number | null;

  @Column('int', { name: 'keyword_count', default: 0 })
  keyword_count: number;

  @OneToMany(() => GamesRatings, gamesRatings => gamesRatings.Game)
  Games_ratings: GamesRatings[];

  @OneToMany(() => Alarms, alarms => alarms.Game)
  Alarms: Alarms[];

  @OneToMany(
    () => GamePurchaseRecords,
    gamePurchaseRecords => gamePurchaseRecords.Game,
  )
  Game_purchase_records: GamePurchaseRecords[];

  @ManyToMany(() => Users, users => users.Purchased_games)
  Purchasers: Users[];

  @OneToMany(_ => AlarmResults, alarmResults => alarmResults.Game)
  Alarm_results: AlarmResults[];
}
