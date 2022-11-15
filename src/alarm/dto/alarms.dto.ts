import { ApiProperty } from '@nestjs/swagger';
import { Alarms } from 'src/entities/alarms.entity';
import { Users } from 'src/entities/users.entity';

export class AlarmsDto extends Alarms {
  @ApiProperty({
    name: 'host_id',
    description: '알람 생성자',
    example: 1,
  })
  public host: Users;

  @ApiProperty({
    name: 'members',
    description: '알람 참가자 목록',
    type: [Users],
  })
  public members: Users[];

  @ApiProperty({
    name: 'gameId',
    description: '게임 id',
    example: 1,
  })
  public gameId: number;
}
