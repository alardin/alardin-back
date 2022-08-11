import { ApiProperty } from "@nestjs/swagger";

export class GameChannelDto {
    @ApiProperty({
        name: 'channel_name',
        example: '1_1_6',
    })
    public channel_name: string
}