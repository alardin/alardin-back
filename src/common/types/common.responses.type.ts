import { ApiProperty } from "@nestjs/swagger";

export class OnlyStatusResponse {
    @ApiProperty({
        name: 'status',
        example: 'OK'
    })
    public status: 'OK' | 'FAIL'
}