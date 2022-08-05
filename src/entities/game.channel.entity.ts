import { IsNotEmpty, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Alarms } from "./alarms.entity";

@Entity({name: 'game_channel', schema: 'alardin' })
export class GameChannel {
    @PrimaryGeneratedColumn()
    id: number;

    @IsNotEmpty()
    @IsString()
    @Column({ name: 'name' })
    name: string;

    @IsNotEmpty()
    @IsString()
    @Column({ name: 'Alarm_id' })
    Alarm_id: number;

    @OneToOne(() => Alarms)
    @JoinColumn({ name: 'Alarm_id', referencedColumnName: 'id' })
    Alarm: Alarms;
    // alarm
    // memebers
    // images

    @CreateDateColumn()
    created_at: Date;

}