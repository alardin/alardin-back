import { create } from "domain";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GamePlay } from "./game-play.entity";
import { GamePlayImages } from "./game-play.images.entity";

@Entity({ name: 'game_used_images', schema: 'alardin' })
export class GameUsedImages {

    @CreateDateColumn()
    created_at: Date;

    @Column({ name: 'Game_play_id', primary: true })
    Game_play_id: number;

    @Column({ name: 'Game_play_image_id', primary: true })
    Game_play_image_id: number;

    @ManyToOne(() => GamePlay, gamePlay => gamePlay.Game_used_images)
    @JoinColumn({ name: 'Game_play_id', referencedColumnName: 'id' })
    Game_play: GamePlay;

    @ManyToOne(() => GamePlayImages, GamePlayImages => GamePlayImages.Game_used_images)
    @JoinColumn({ name: 'Game_play_image_id', referencedColumnName: 'id' })
    Game_play_image: GamePlayImages
}