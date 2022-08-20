import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive, Max, Min } from "class-validator";
import { IsPositiveInt } from "src/common/decorators/positive.integer.validator";

export class RateGameDto {

    @ApiProperty({
        name: 'score',
        description: '1~5',
        example: 4
    })
    @IsPositiveInt()
    @Max(5)
    @Min(1)
    @IsNotEmpty()
    score: number;
}

export class RateResponse {
    @ApiProperty({
        name: 'updatedScore',
        example: '3.5'
    })
    updatedScore: number;
}