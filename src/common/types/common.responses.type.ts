import { ApiProperty } from "@nestjs/swagger";

export class OnlyStatusResponse {
    @ApiProperty({
        name: 'status',
        example: 'ok'
    })
    public status: 'ok' | 'fail'
}