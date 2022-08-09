import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'game_play_single', schema: 'alardin'})
export class GamePlaySingle {
    @PrimaryGeneratedColumn()
    id: number;
}