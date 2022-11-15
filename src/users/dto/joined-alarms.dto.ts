import { ApiProperty } from '@nestjs/swagger';
import { AlarmSummaryDto } from 'src/alarm/dto/alarm-summary.dto';
import { GameSummaryDto } from 'src/game/dto/game-summary.dto';
import { UserSummaryDto } from './user-summary.dto';

export class JoinedAlarmsDto extends AlarmSummaryDto {
  @ApiProperty({
    name: 'Members',
    type: UserSummaryDto,
  })
  Members: UserSummaryDto;
  @ApiProperty({
    name: 'Game',
    type: GameSummaryDto,
  })
  Game: GameSummaryDto;
}
