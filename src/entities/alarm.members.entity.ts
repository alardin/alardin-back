import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Alarms } from './alarms.entity';
import { Users } from './users.entity';

@Entity({ schema: 'alardin', name: 'alarm_members' })
export class AlarmMembers {
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('int', { name: 'User_id', primary: true })
  User_id: number;

  @Column('int', { name: 'Alarm_id', primary: true })
  Alarm_id: number;

  @ManyToOne(() => Users, users => users.Alarm_members, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'User_id', referencedColumnName: 'id' }])
  User: Users;

  @ManyToOne(() => Alarms, alarms => alarms.Alarm_members, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'Alarm_id', referencedColumnName: 'id' }])
  Alarm: Alarms;
}
