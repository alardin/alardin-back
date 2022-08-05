import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Alarms } from "./alarms.entity";
import { GamePlayImages } from "./game-play.images.entity";
import { GameUsedImages } from "./game.used-images.entity";

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

    @OneToMany(() => GameUsedImages, gameUsedImages => gameUsedImages.Game_play)
    Game_used_images: GameUsedImages[];

    @ManyToMany(() => GamePlayImages, gamePlayImages => gamePlayImages.Game_play, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinTable({
        name: 'game_used_images',
        joinColumn: {
            name: 'Game_play_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'Game_play_image_id',
            referencedColumnName: 'id'
        }
    })
    Images_used: GamePlayImages[];

    
    /**
     * 알람에 채널 정보 있음,
     * if 채널 접속 멤버 수 == 알람 멤버 수 => 시작
     * else 예외상황인데 처리는 일단 보류
     */

}