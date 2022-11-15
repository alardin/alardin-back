import { IntersectionType, OmitType } from '@nestjs/swagger';
import { AlarmsDto } from 'src/alarm/dto/alarms.dto';
import { AlarmResults } from 'src/entities/alarm.results.entity';

export class GameInfoDto extends OmitType(
  IntersectionType(AlarmResults, AlarmsDto),
  [
    'created_at',
    'id',
    'is_private',
    'is_repeated',
    'time',
    'updated_at',
    'Game_channel_id',
    'Game_id',
  ],
) {}
