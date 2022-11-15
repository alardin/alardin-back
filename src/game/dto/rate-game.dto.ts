import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
export class RateGameDto {
  @ApiProperty({
    name: 'score',
    description: '1~5',
    example: 4,
  })
  @IsInt()
  @IsPositive()
  @Max(5)
  @Min(1)
  @IsNotEmpty()
  score: number;
}

export class RateResponse {
  @ApiProperty({
    name: 'updatedScore',
    example: '3.5',
  })
  updatedScore: number;
}
