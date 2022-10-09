import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsString } from "class-validator";

export class SendPushDto {
    @ApiProperty({
        name: '<any key>',
        example: '<any value>'
    })
    @IsObject()
    data?: { [key:string]: string };

    @ApiProperty({
        name: 'title',
        example: 'notification title'
    })
    @IsString()
    @IsNotEmpty()
    title: string; 

    @ApiProperty({
        name: 'body',
        example: 'notification body'
    })
    @IsString()
    @IsNotEmpty()
    body: string;
} 