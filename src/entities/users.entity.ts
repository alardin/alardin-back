import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsUrl } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Alarms } from "./alarms.entity";
import { AlarmMembers } from "./alarm.members.entity";
import { Assets } from "./assets.entity";
import { GamesRatings } from "./games.ratings.entity";
import { Mates } from "./mates.entity";
import { CoinUseRecords } from "./coin.use.records.entity";
import { PremiumOrders } from "./premium.orders.entity";
import { Games } from "./games.entity";
import { GamePurchaseRecords } from "./game.purchase.records.entity";
import { Premiums } from "./premiums.entity";
import { AlarmResults } from "./alarm.results.entity";
import { AlarmPlayRecords } from "./alarm.play.records.entity";
import { Notifications } from "./notifications.entity";
import { MateRequestRecords } from "./mate-request.records.entity";
import { PremiumRefunds } from "./premium.refunds.entity";

@Entity({ schema: 'alardin', name: 'users' })
export class Users {
    @ApiProperty({
        name: 'id',
        example: '1'
    })
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        name: 'email',
        required: true,
        example: 'bbangjo@gmail.com'
    })
    @Column('varchar', { name: 'email', unique: true, length: 320 })
    email: string;

    @IsString()
    @ApiProperty({
        name: 'name',
        required: true,
        example: '조병근'
    })
    @Column('varchar', { name: 'name', length: 30, default: '' })
    name: string;

    @IsString()
    @ApiProperty({
        name: 'nickname',
        required: true,
        example: 'bbangjo'
    })
    @Column('varchar', { name: 'nickname', unique: true, length: 30 })
    nickname: string;

    @IsString()
    @ApiProperty({
        name: 'bio',
        example: 'Hello, I\'m bbangjo!'
    })
    @Column('varchar', { name: 'bio', length:500, default: '' })
    bio: string;

    @IsUrl()
    @ApiProperty({
        name: 'profile_image_url',
        required: true,
        example: 'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg'
    })
    @Column('varchar', { name: 'profile_image_url', length: 2048 })
    profile_image_url: string;

    @IsUrl()
    @ApiProperty({
        name: 'thumbnail_image_url',
        required: true,
        example: 'https://cdn.kakao.com/img/20190201_iahpdf_168108123.jpg'
    })
    @Column('varchar', { name: 'thumbnail_image_url', length: 2048 })
    thumbnail_image_url: string;

    @Column('boolean', { name: 'is_default_image', default: false })
    is_default_image: boolean;
    
    @ApiProperty({
        name: 'age_range',
        example: '20-29'
    })
    @Column('varchar', { name: 'age_range', nullable: true })
    age_range: string | null;

    @ApiProperty({
        name: 'gender',
        example: 'male'
    })
    @Column('varchar', { name: 'gender' })
    gender: string;

    @Column('varchar', { name: 'device_token', nullable: true })
    device_token: string | null;

    @Column('varchar', { name: 'refresh_token', nullable: true })
    refresh_token: string | null;

    @ApiProperty({
        name: 'enroll_date',
        example: '2022-07-24'
    })
    @CreateDateColumn()
    enroll_date: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date | null;

    @Column({ name: 'Asset_id', nullable: true })
    Asset_id: number | null;

    @OneToOne(() => Assets)
    @JoinColumn({ name: 'Asset_id', referencedColumnName: 'id' })
    assets: Assets;

    @OneToMany(() => PremiumRefunds, premiumRefunds => premiumRefunds.User)
    Premium_refunds: PremiumRefunds[];

    @OneToMany(() => Mates, mates => mates.Sender)
    Mate1: Mates[];

    @OneToMany(() => Mates, mates => mates.Receiver)
    Mate2: Mates[];

    @OneToMany(() => Alarms, alarms => alarms.Host)
    Hosted_alarms: Alarms[];

    @OneToMany(() => CoinUseRecords, (coinUseRecords) => coinUseRecords.User)
    Users_asset_records: CoinUseRecords[];

    @OneToMany(() => GamesRatings, gamesRatings => gamesRatings.User)
    Games_ratings: GamesRatings[];

    @OneToMany(() => Notifications, notifications => notifications.User)
    Notifications: Notifications[];

    @OneToMany(() => MateRequestRecords, mateReq => mateReq.Sender)
    Send_requests: MateRequestRecords[];

    @OneToMany(() => MateRequestRecords, mateReq => mateReq.Receiver)
    Receiveds: MateRequestRecords[];
    
    @OneToMany(() => AlarmMembers, alarmsMembers => alarmsMembers.User)
    Alarm_members: AlarmMembers[];
    
    @ManyToMany(() => Alarms, alarms => alarms.Members, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinTable({
        name: 'alarm_members',
        joinColumn: {
            name: 'User_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'Alarm_id',
            referencedColumnName: 'id'
        }
    })
    Joined_alarms: Alarms[];
    
    @OneToMany(() => GamePurchaseRecords, gamePurchaseRecords => gamePurchaseRecords.User)
    Game_purchase_records: GamePurchaseRecords[];
    
    @ManyToMany(() => Games, games => games.Purchasers, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE'
    })
    @JoinTable({
        name: 'game_purchase_records',
        joinColumn: {
            name: 'User_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'Game_id',
            referencedColumnName: 'id'
        }
    })
    Purchased_games: Games[];

    @OneToMany(() => PremiumOrders, premiumOrder => premiumOrder.User)
    Premium_orders: PremiumOrders[];

    @OneToMany(() => AlarmPlayRecords, alarmPlayRecords => alarmPlayRecords.User)
    Alarm_play_records: AlarmPlayRecords[];

    @ManyToMany(() => AlarmResults, alarmResults => alarmResults.Players, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    })
    @JoinTable({
        name: 'alarm_play_records',
        joinColumn: {
            name: 'User_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'Alarm_result_id',
            referencedColumnName: 'id'
        }
    })
    Played_alarms: AlarmResults[];
}