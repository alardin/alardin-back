import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
// { trial: number, play_time: number, data?: object };
export class AlarmResultsDto {
  @ApiProperty({
    name: 'trial',
    example: 3,
  })
  @IsNumber()
  @IsNotEmpty()
  public trial: number;

  @ApiProperty({
    name: 'play_time',
    example: 60,
  })
  @IsNumber()
  @IsNotEmpty()
  public play_time: number;

  @ApiProperty({
    name: 'data',
    example: { foo: 'bar' },
  })
  public data?: object;
}
