import { ApiProperty } from "@nestjs/swagger";

export class GameChannelDto {
    @ApiProperty({
        name: 'channelId',
        example: '1_1_6',
    })
    public channelId: string
}