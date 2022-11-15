import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Premiums } from './premiums.entity';
import { Users } from './users.entity';

@Entity({ schema: 'alardin', name: 'premium_orders' })
export class PremiumOrders {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price: number;

  @Column()
  pay_type: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ name: 'successed_at' })
  successed_at: Date;

  @Column({ name: 'expired_at' })
  expired_at: Date;

  @Column({ name: 'next_order_at' })
  next_order_at: Date;

  @Column({ name: 'result_status' })
  result_status: string;

  @Column({ name: 'result_message' })
  result_message: string;

  @Column({ name: 'User_id', nullable: true })
  User_id: number | null;

  @Column({ name: 'Premium_id', nullable: true })
  Premium_id: number | null;

  @ManyToOne(() => Users, users => users.Premium_orders, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'User_id', referencedColumnName: 'id' }])
  User: Users;

  @ManyToOne(() => Premiums, premiums => premiums.Premium_orders, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'Premium_id', referencedColumnName: 'id' }])
  Premium: Premiums;
}
