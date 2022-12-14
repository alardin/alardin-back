import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDataURI,
  IsDate,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsNumber,
  IsObject,
} from 'class-validator';
import { AlarmResultsDto } from 'src/alarm/dto/alarm-result.dto';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AlarmPlayRecords } from './alarm.play.records.entity';
import { Alarms } from './alarms.entity';
import { Games } from './games.entity';
import { Users } from './users.entity';

@Entity({ schema: 'alardin', name: 'alarm_results' })
export class AlarmResults {
  @ApiProperty({
    name: 'id',
    example: '1',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    name: 'data',
    example: { trial: 3, play_time: 30, data: { foo: 'bar' } },
    type: AlarmResultsDto,
  })
  @IsNotEmpty()
  @IsObject()
  @Column('json', { name: 'data', nullable: false, default: {} })
  data: { trial: number; play_time: number; data?: object };

  @ApiProperty({
    name: 'start_time',
    example: '2022-07-22:09:00:00',
  })
  @IsNotEmpty()
  @Column('datetime', { name: 'start_time' })
  start_time: Date;

  @ApiProperty({
    name: 'end_time',
    example: '2022-07-22:09:03:00',
  })
  @IsNotEmpty()
  @Column('datetime', { name: 'end_time' })
  end_time: Date;

  @ApiProperty({
    name: 'is_cleared',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Column('boolean', { name: 'is_cleared', default: false })
  is_cleared: boolean;

  @ApiProperty({
    name: 'Game_id',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Column({ name: 'Game_id' })
  Game_id: number;

  @ApiProperty({
    name: 'Alarm_id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Column({ name: 'Alarm_id' })
  Alarm_id: number;

  @ManyToOne(() => Games, games => games.Alarm_results)
  @JoinColumn([{ name: 'Game_id', referencedColumnName: 'id' }])
  Game: Games;

  @ManyToOne(() => Alarms, alarms => alarms.Alarm_results, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'Alarm_id', referencedColumnName: 'id' }])
  Alarm: Alarms;

  @OneToMany(
    () => AlarmPlayRecords,
    alarmPlayRecords => alarmPlayRecords.Alarm_result,
  )
  Alarm_play_records: AlarmPlayRecords[];

  @ManyToMany(() => Users, users => users.Played_alarms)
  Players: Users[];
}
