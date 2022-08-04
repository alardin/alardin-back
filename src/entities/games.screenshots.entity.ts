import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Games } from "./games.entity";

@Entity({schema: 'alardin', name: 'games_screenshots' })
export class GamesScreenshots {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { name: 'screenshot_url', length: 2048 })
    screenshot_url: string;

    @Column({ name: 'Game_id', nullable: true })
    Game_id: number | null;

    @ManyToOne(() => Games, games=>games.Games_screenshots, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    })
    @JoinColumn([{ name: 'Game_id', referencedColumnName: 'id' }])
    Game: Games;

}