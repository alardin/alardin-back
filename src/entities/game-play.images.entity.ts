import { IsNotEmpty, IsString, IsUrl } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GamePlayKeywords } from "./game-play.keywords.entity";

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
    
    @ManyToOne(_ => GamePlayKeywords, gamePlayKeywords => gamePlayKeywords.Images)
    @JoinColumn([{ name: 'Keyword_id', referencedColumnName: 'id' }])
    Keyword: GamePlayKeywords;
}