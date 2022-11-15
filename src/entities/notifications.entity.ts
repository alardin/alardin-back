import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity({ schema: 'alardin', name: 'notifications' })
export class Notifications {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column('int', { name: 'User_id', nullable: true })
  User_id: number | null;

  @Column('varchar', { name: 'title' })
  title: string;

  @Column('varchar', { name: 'body', length: 500 })
  body: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Users, users => users.Notifications)
  @JoinColumn({ name: 'User_id', referencedColumnName: 'id' })
  User: Users;
}
