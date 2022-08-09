import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Matches } from "class-validator";

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
    @IsString()
    @Matches(/^(ACCEPT|REJECT)$/gm)
    public response: 'ACCEPT' | 'REJECT'

}