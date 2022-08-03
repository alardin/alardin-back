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
        name: 'time',
        example: '15:30'
    })
    @Column()
    time: string;

    @ApiProperty({
        name: 'is_repeated',
        example: "123"
    })
    @Column('varchar', { name: 'is_repeated'})
    is_repeated: string;

    @ApiProperty({
        name: 'is_private',
        example: false
    })
    @Column()
    is_private: boolean;


    @ApiProperty({
        name: 'music_volume',
        example: 70
    })
    @Column({ default: 100 })
    music_volume: number;

    @Column('int', { name: 'member_count', nullable: true })
    member_count: number | null;

    @Column({ default: 2 })
    max_members: number;

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