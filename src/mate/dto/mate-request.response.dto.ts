import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";
import { IsMatchWithRegex } from "src/common/decorators/match.validator";

export class MateRequestReponseDto {

    @ApiProperty({
        name: 'senderId',
        example: 1,
        description: '메이트 요청한 사용자의 id'
    })
    @IsNotEmpty()
    @IsNumber()
    public senderId: number;

    @ApiProperty({
        name: 'response',
        example: 'ACCEPT',
        description: '요청에 대한 응답'
    })
    @IsNotEmpty()
    @IsMatchWithRegex(/ACCPET|REJECT/)
    public response: 'ACCEPT' | 'REJECT'

}