import { ApiProperty } from "@nestjs/swagger";
import { NumberList } from "aws-sdk/clients/iot";
import { IsBoolean, IsDataURI, IsDate, IsDateString, IsNotEmpty, IsNumber } from "class-validator";
import { IsPositiveInt } from "src/common/decorators/positive.integer.validator";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AlarmPlayRecords } from "./alarm.play.records.entity";
import { Alarms } from "./alarms.entity";
import { GameChannel } from "./game.channel.entity";
import { Games } from "./games.entity";
import { Users } from "./users.entity";

@Entity({ schema: 'alardin', name: 'alarm_results'})
export class AlarmResults {
    @ApiProperty({
        name: 'id',
        example: '1'
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        name: 'start_time',
        example: '2022-07-22:09:00:00'
    })
    @IsDateString()
    @IsNotEmpty()
    @Column('date', { name: 'start_time' })
    start_time: Date;

    @ApiProperty({
        name: 'end_time',
        example: '2022-07-22:09:03:00'
    })
    @IsDateString()
    @IsNotEmpty()
    @Column('date', { name: 'end_time' })
    end_time: Date;

    @ApiProperty({
        name: 'play_time',
        description: 'end_time - start_time',
        example: '180'
    })
    @IsPositiveInt()
    @IsNotEmpty()
    @Column('int', { name: 'play_time' })
    play_time: number;

    @ApiProperty({
        name: 'is_bot_used',
        example: false,
    })
    @IsBoolean()
    @IsNotEmpty()
    @Column('boolean', { name: 'is_bot_used' })
    is_bot_used: boolean;

    @ApiProperty({
        name: 'trial',
        example: 3
    })
    @IsPositiveInt()
    @IsNotEmpty()
    @Column('int', { name: 'trial', default: 0 })
    trial: number;

    @IsBoolean()
    @IsNotEmpty()
    @Column('boolean', { name: 'is_cleared', default: false })
    is_cleared: boolean;

    @ApiProperty({
        name: 'Game_channel_id',
        example: 1
    })
    @IsNumber()
    @IsNotEmpty()
    @Column({ name: 'Game_channel_id' })
    Game_channel_id: number;

    @ApiProperty({
        name: 'Game_id',
        example: 1
    })
    @IsNotEmpty()
    @IsNumber()
    @Column({ name: 'Game_id' })
    Game_id: number;

    @ApiProperty({
        name: 'Alarm_id',
        example: 1
    })
    @IsNotEmpty()
    @IsNumber()
    @Column({ name: 'Alarm_id' })
    Alarm_id: number;

    @OneToOne(() => GameChannel)
    @JoinColumn({ name: 'Game_channel_id', referencedColumnName: 'id' })
    Game_channel: GameChannel;

    @ManyToOne(() => Games, games => games.Alarm_results)
    @JoinColumn([{ name: 'Game_id', referencedColumnName: 'id' }])
    Game: Games;

    @ManyToOne(() => Alarms, alarms => alarms.Alarm_results, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn([
        { name: 'Alarm_id', referencedColumnName: 'id' }
    ])
    Alarm: Alarms;

    @OneToMany(() => AlarmPlayRecords, alarmPlayRecords => alarmPlayRecords.Alarm_result)
    Alarm_play_records: AlarmPlayRecords[];

    @ManyToMany(() => Users, users => users.Played_alarms)
    Players: Users[];
}