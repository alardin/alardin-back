import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { AlarmResults } from "./alarm.results.entity";
import { Users } from "./users.entity";

@Entity({schema: 'alardin', name: 'alarm_play_records'})
export class AlarmPlayRecords {

    @PrimaryColumn()
    id: number;
    
    @CreateDateColumn()
    created_at: Date;

    @Column('int', { name: 'User_id', nullable: true })
    User_id: number | null;

    @Column('int', { name: 'Alarm_result_id', nullable: true })
    Alarm_result_id: number | null;

    @ManyToOne(() => Users, users => users.Alarm_play_records)
    @JoinColumn([{ name: 'User_id', referencedColumnName: 'id' }])
    User: Users;

    @ManyToOne(() => AlarmResults, alarmResults => alarmResults.Alarm_play_records)
    @JoinColumn([{ name: 'Alarm_result_id', referencedColumnName: 'id' }])
    Alarm_result: AlarmResults;

}