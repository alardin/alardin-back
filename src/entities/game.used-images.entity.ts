import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne } from "typeorm";
import { GamePlayImages } from "./game-play.images.entity";
import { GameChannel } from "./game.channel.entity";

@Entity({ name: 'game_used_images', schema: 'alardin' })
export class GameUsedImages {

    @CreateDateColumn()
    created_at: Date;

    @Column({ name: 'Game_channel_id', primary: true })
    Game_channel_id: number;

    @Column({ name: 'Game_play_image_id', primary: true })
    Game_play_image_id: number;

    @Column({ name: 'keyword' })
    keyword: string;

    @ManyToOne(() => GameChannel, gameChannel => gameChannel.Images)
    @JoinColumn({ name: 'Game_channel_id', referencedColumnName: 'id' })
    Game_channel: GameChannel;

    @ManyToOne(() => GamePlayImages, GamePlayImages => GamePlayImages.Game_used_images)
    @JoinColumn({ name: 'Game_play_image_id', referencedColumnName: 'id' })
    Game_play_image: GamePlayImages;
}