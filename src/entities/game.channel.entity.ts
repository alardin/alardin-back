import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Alarms } from "./alarms.entity";

@Entity({name: 'game_channel', schema: 'alardin' })
export class GameChannel {
    @PrimaryGeneratedColumn()
    id: number;

    @IsNotEmpty()
    @IsString()
    @Column({ name: 'name' })
    name: string;

    @IsNumber()
    @Column({ name: 'player_count', default: 0 })
    player_count: number;

    @IsNotEmpty()
    @IsString()
    @Column({ name: 'Alarm_id' })
    Alarm_id: number;

    @OneToOne(() => Alarms, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'Alarm_id', referencedColumnName: 'id'})
    Alarm: Alarms;

    @CreateDateColumn()
    created_at: Date;
    
}