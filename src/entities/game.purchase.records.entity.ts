import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Games } from './games.entity';
import { Users } from './users.entity';

@Entity({ schema: 'alardin', name: 'game_purchase_records' })
export class GamePurchaseRecords {
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('int', { name: 'User_id', primary: true })
  User_id: number;

  @Column('int', { name: 'Game_id', primary: true })
  Game_id: number;

  @ManyToOne(() => Users, users => users.Game_purchase_records)
  @JoinColumn([{ name: 'User_id', referencedColumnName: 'id' }])
  User: Users;

  @ManyToOne(() => Games, games => games.Game_purchase_records)
  @JoinColumn([{ name: 'Game_id', referencedColumnName: 'id' }])
  Game: Games;
}
