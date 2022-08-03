import { ApiProperty } from "@nestjs/swagger";

export class GameResponse {
    
    @ApiProperty({
        name: 'correct',
        example: true
    })
    public correct: boolean
}