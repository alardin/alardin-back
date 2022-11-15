import { ApiProperty } from '@nestjs/swagger';
import { HostedAlarmsDto } from './hosted-alarms.dto';
import { JoinedAlarmsDto } from './joined-alarms.dto';

export class UserAlarmsDto {
  @ApiProperty({
    name: 'joinedAlarms',
    type: [JoinedAlarmsDto],
  })
  joinedAlarms: JoinedAlarmsDto[];
  @ApiProperty({
    name: 'hostedAlarms',
    type: [HostedAlarmsDto],
  })
  hostedAlarms: HostedAlarmsDto[];
}
