import { ApiProperty } from '@nestjs/swagger';

export class JoinChannelDto {
  @ApiProperty({
    name: 'alarmId',
    example: '1',
  })
  public alarmId: number;
}
