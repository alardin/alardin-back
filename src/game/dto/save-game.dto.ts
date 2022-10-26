import { PickType } from '@nestjs/swagger';
import { AlarmResults } from 'src/entities/alarm.results.entity';

export class SaveGameDto extends PickType(AlarmResults, [
  'start_time',
  'end_time',
  'Game_id',
  'Alarm_id',
  'is_cleared',
  'data',
]) {}
