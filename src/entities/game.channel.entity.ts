import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Alarms } from "./alarms.entity";
import { GamePlayImages } from "./game-play.images.entity";

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

    @OneToOne(() => Alarms)
    @JoinColumn({ name: 'Alarm_id', referencedColumnName: 'id' })
    Alarm: Alarms;

    @CreateDateColumn()
    created_at: Date;


    @ManyToMany(() => GamePlayImages, gamePlayImages => gamePlayImages.Game_channel, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinTable({
        name: 'game_used_images',
        joinColumn: {
            name: 'Game_channel_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'Game_play_image_id',
            referencedColumnName: 'id'
        }
    })
    Images: GamePlayImages[];
    
}