import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Games } from "./games.entity";
import { Users } from "./users.entity";

@Entity({ schema: 'alardin', name: 'games_ratings' })
export class GamesRatings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('int', { name: 'score',})
    score: number;

    @CreateDateColumn()
    created_at: Date;

    // @Column('int', { name: 'User_id', nullable: true})
    // User_id: number | null;

    // @Column('int', { name: 'Game_id', nullable: true})
    // Game_id: number | null;
    
    @ManyToOne(() => Users, users => users.Games_ratings, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE'
    })
    @JoinColumn([{ name: 'User_id', referencedColumnName: 'id' }])
    User: Users;

    @ManyToOne(() => Games, games => games.Games_ratings, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    })
    @JoinColumn([{ name: 'Game_id', referencedColumnName: 'id' }])
    Game: Games;

}