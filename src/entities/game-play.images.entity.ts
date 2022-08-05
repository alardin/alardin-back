import { IsNotEmpty, IsString, IsUrl } from "class-validator";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { GamePlay } from "./game-play.entity";
import { GamePlayKeywords } from "./game-play.keywords.entity";
import { GameUsedImages } from "./game.used-images.entity";

@Entity({ name: 'game_play_images', schema: 'alardin' })
export class GamePlayImages {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'Keyword_id', nullable: true })
    Keyword_id: number | null;

    @IsUrl()
    @IsNotEmpty()
    @Column({ name: 'url' })
    url: string;

    @OneToMany(() => GameUsedImages, gameUsedImages => gameUsedImages.Game_play)
    Game_used_images: GameUsedImages[];

    @ManyToOne(_ => GamePlayKeywords, gamePlayKeywords => gamePlayKeywords.Images, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn([{ name: 'Keyword_id', referencedColumnName: 'id' }])
    Keyword: GamePlayKeywords;

    @ManyToMany(() => GamePlay, gamePlay => gamePlay.Images_used)
    Game_play: GamePlay[];

}