import { CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'game_channel', schema: 'alardin' })
export class GameChannel {
    @PrimaryGeneratedColumn()
    id: number;

    // alarm
    // memebers
    // images

    @CreateDateColumn()
    created_at: Date;

}