import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity({ schema: 'alardin' })
export class MateRequestRecords {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('bool', { name: 'is_accepted' })
  is_accepted: number;

  @Column('bool', { name: 'is_rejected' })
  is_rejected: number;

  @CreateDateColumn({ name: 'sended_at' })
  sended_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @Column({ name: 'Sender_id', nullable: true })
  Sender_id: number;

  @Column({ name: 'Receiver_id', nullable: true })
  Receiver_id: number | null;

  @ManyToOne(() => Users, users => users.Send_requests)
  @JoinColumn({ name: 'Sender_id', referencedColumnName: 'id' })
  Sender: Users;

  @ManyToOne(() => Users, users => users.Receiveds)
  @JoinColumn({ name: 'Receiver_id', referencedColumnName: 'id' })
  Receiver: Users;
}
