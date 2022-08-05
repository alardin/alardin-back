import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Alarms } from "./alarms.entity";

@Entity({ name: 'game_play', schema: 'alardin' })
export class GamePlay {
    @PrimaryGeneratedColumn()
    id: number;

    //  alarm
    @Column({ name: 'Alarm_id', nullable: true })
    Alarm_id: number | null;

    @OneToOne(() => Alarms)
    @JoinColumn([{ name: 'Alarm_id', referencedColumnName: 'id' }])
    Alarm: Alarms;
    // members = Alarm.members
    // keyword of images - 걍 로직으로 처리

    /**
     * 알람에 채널 정보 있음,
     * if 채널 접속 멤버 수 == 알람 멤버 수 => 시작
     * else 예외상황인데 처리는 일단 보류
     */

}