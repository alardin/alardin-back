import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AlarmPlayRecords } from "./alarm.play.records.entity";
import { Alarms } from "./alarms.entity";
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
    @Column('date', { name: 'start_time' })
    start_time: Date;

    @ApiProperty({
        name: 'end_time',
        example: '2022-07-22:09:03:00'
    })
    @Column('date', { name: 'end_time' })
    end_time: Date;

    @ApiProperty({
        name: 'total_time',
        example: '180'
    })
    @Column('int', { name: 'total_time' })
    total_time: number;

    @ApiProperty({
        name: 'is_bot_used',
        example: false,
    })
    @Column('boolean', { name: 'is_bot_used' })
    is_bot_used: boolean;

    @ManyToOne(() => Alarms, alarms => alarms.Alarm_results, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn([
        { name: 'Alarm_id', referencedColumnName: 'id' },
        { name: 'Host_id', referencedColumnName: 'Host_id' },
        { name: 'Game_id', referencedColumnName: 'Game_id' }
    ])
    Alarm: Alarms;

    @OneToMany(() => AlarmPlayRecords, alarmPlayRecords => alarmPlayRecords.Alarm_result)
    Alarm_play_records: AlarmPlayRecords[];

    @ManyToMany(() => Users, users => users.Played_alarms)
    Players: Users[];
}