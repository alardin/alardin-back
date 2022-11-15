import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class JoinAlarmDto {
  @ApiProperty({
    name: 'alarmId',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  alarmId: number;
}
