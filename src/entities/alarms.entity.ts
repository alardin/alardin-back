import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AlarmMembers } from "./alarm.members.entity";
import { AlarmResults } from "./alarm.results.entity";
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
        name: 'time_setting',
        example: '2022-07-22:09:00:00'
    })
    @Column()
    time_setting: string;

    @ApiProperty({
        name: 'is_private',
        example: false
    })
    @Column()
    is_private: boolean;

    @ApiProperty({
        name: 'is_repeated',
        example: true
    })
    @Column()
    is_repeated: boolean;

    @ApiProperty({
        name: 'music_volume',
        example: 70
    })
    @Column()
    music_volume: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date | null;

    @Column('int', { name: 'Host_id', primary: true })
    Host_id: number;

    @Column('int', { name: 'Game_id', primary: true })
    Game_id: number;

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
}