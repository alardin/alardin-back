import { ApiProperty } from "@nestjs/swagger";

export class SendPushDto {
    @ApiProperty({
        name: '<any key>',
        example: '<any value>'
    })
    data: string;
    @ApiProperty({
        name: 'title',
        example: 'notification title'
    })
    title: string; 
    @ApiProperty({
        name: 'body',
        example: 'notification body'
    })
    body: string;
} 