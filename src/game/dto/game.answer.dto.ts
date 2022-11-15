import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GameAnswerDto {
  @ApiProperty({
    name: 'Qnumber',
    description: '문제 번호',
    example: 1,
  })
  @IsNumber()
  public Qnumber: number;

  @ApiProperty({
    name: 'try',
    description: '시도 횟수',
    example: 2,
  })
  @IsNumber()
  public try: number;

  @ApiProperty({
    name: 'answer',
    example: 3,
  })
  @IsNumber()
  public answer: number;
}
