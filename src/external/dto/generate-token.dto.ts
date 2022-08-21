import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Matches } from "class-validator";

export class GenerateRtcTokenDto {
    
    @ApiProperty({
        name: 'channelName',
        example: 1,
        description: '현재로는 alarmId를 쓸 생각'
    })
    @IsNotEmpty()
    @IsString()
    channelName: string;

    @ApiProperty({
        name: 'role',
        description: 'publisher | audience',
        example: 'publisher'
    })
    @IsNotEmpty()
    @Matches(/^(publisher)|(audience)$/)
    role: 'publisher' | 'audience';
    
    @ApiProperty({
        name: 'tokenType',
        description: 'uid',
        example: 'userAccount'
    })
    @IsNotEmpty()
    @Matches(/^(uid)$/)
    tokenType: 'uid';

    @ApiProperty({
        name:' uid',
        description: '채널 내 사용자 구분 시 사용됨',
        example: 1
    })
    @IsNotEmpty()
    uid: string;
}