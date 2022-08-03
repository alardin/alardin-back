import { ApiProperty } from "@nestjs/swagger";

export class MateRequestReponseDto {

    @ApiProperty({
        name: 'requester_id',
        example: 1,
        description: '메이트 요청한 사용자의 id'
    })
    public requester_id: number;

    @ApiProperty({
        name: 'response',
        example: 'accpet',
        description: '요청에 대한 응답'
    })
    public response: 'accept' | 'reject'

}