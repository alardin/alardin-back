import { IsNotEmpty, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { GamePlayImages } from "./game-play.images.entity";
import { Games } from "./games.entity";

@Entity({ name: 'game_play_keywords', schema: 'alardin' })
export class GamePlayKeywords {
    
    @PrimaryGeneratedColumn()
    id: number;

        @IsNotEmpty()
        @IsString()
    @Column('varchar', { name: 'keyword'})
    keyword: string;

    @CreateDateColumn()
    created_at : Date;
    
    @Column({ name: 'Game_id', nullable: true })
    Game_id: number | null;

    @OneToMany(_ => GamePlayImages, gamePlayImages => gamePlayImages.Keyword)
    Images: GamePlayImages[];

    @ManyToOne(_ => Games, games => games.Game_play_keywords)
    @JoinColumn([{ name: 'Game_id', referencedColumnName:'id' }])
    Game: Games;
}