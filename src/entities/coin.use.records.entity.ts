import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity({ schema: 'alardin', name: 'coin_use_records' })
export class CoinUseRecords {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  purchase_time: Date;

  @Column()
  used_coin: number;

  @Column()
  remain_coin: number;

  @Column({ name: 'User_id', nullable: true })
  User_id: number | null;

  @ManyToOne(() => Users, users => users.Users_asset_records, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn([{ name: 'User_id', referencedColumnName: 'id' }])
  User: Users;
}
