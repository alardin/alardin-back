import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsIn, IsInt, IsNotEmpty, IsNumber, IsNumberString, IsPositive, IsString, Matches, Max, MaxLength, Min, MIN, ValidateIf } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AlarmMembers } from "./alarm.members.entity";
import { AlarmResults } from "./alarm.results.entity";
import { GameChannel } from "./game.channel.entity";
import { Games } from "./games.entity";
import { Users } from "./users.entity";

@Entity()
export class Alarms {

    @ApiProperty({
        name: 'id',
        example: 1
    })
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @ApiProperty({
        name: 'name',
        example: 'alarm 1'
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    @Column({ name: 'name', default: '' })
    name: string;
    @ApiProperty({
        name: 'time',
        example: '15:30'
    })
    @Matches(/\d{2}:\d{2}/)
    @IsNotEmpty()
    @Column()
    time: string;

    @ApiProperty({
        name: 'is_repeated',
        example: "123",
        description: "월, 화, 수 반복"
    })
    @IsNumberString()
    @MaxLength(7)
    @IsNotEmpty()
    @Column({ name: 'is_repeated'})
    is_repeated: string;

    @ApiProperty({
        name: 'is_private',
        example: false
    })
    @IsBoolean()
    @IsNotEmpty()
    @Column()
    is_private: boolean;

    @ApiProperty({
        name: 'music_name',
        example: 'Cooped Up'
    })
    @IsString()
    @IsNotEmpty()
    @Column({ name: 'music_name', default: '' })
    music_name: string;

    @ApiProperty({
        name: 'music_volume',
        example: 70
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsNotEmpty()
    @Column({ default: 100 })
    music_volume: number;
    
    @IsInt()
    @IsPositive()
    @Column('int', { name: 'member_count', default: 0 })
    member_count: number;

    @ApiProperty({
        name: 'max_members',
        example: 2
    })
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    @Column({ name: 'max_member', default: 2 })
    max_members: number;

    @IsDate()
    @CreateDateColumn()
    created_at: Date;

    @IsDate()
    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date | null;

    @Column('int', { name: 'Host_id', primary: true })
    Host_id: number;

    @ApiProperty({
        name: 'Game_id',
        example: 1
    })
    @Column('int', { name: 'Game_id', primary: true })
    Game_id: number;

    @Column('int', { name: 'Game_channel_id', nullable: true })
    Game_channel_id: number | null;

    @OneToOne(() => GameChannel, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'Game_channel_id', referencedColumnName: 'id' })
    Game_channel: GameChannel;

    @ManyToOne(() => Users, users => users.Hosted_alarms, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE'
    })
    @JoinColumn([{ name: 'Host_id', referencedColumnName: 'id' }])
    Host: Users;

    @ManyToOne(() => Games, games => games.Alarms, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE'
    })
    @JoinColumn([{ name: 'Game_id', referencedColumnName: 'id' }])
    Game: Games;

    @OneToMany(() => AlarmResults, alarmResults => alarmResults.Alarm)
    Alarm_results: AlarmResults[];

    @OneToMany(() => AlarmMembers, alarmMembers => alarmMembers.Alarm)
    Alarm_members: AlarmMembers[];

    @ManyToMany(() => Users, users => users.Joined_alarms)
    Members: Users[];

    // Channel OneToOne
    // 랜덤 시드 for 게임 keyword, 게임 이미지
}