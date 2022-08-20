import { ApiProperty } from "@nestjs/swagger";

export class StartGameDto {
    @ApiProperty({
        name: "rtcToken",
        example: "<Token>"
    })
    rtcToken: string;
    
    @ApiProperty({
        name: "rtmToken",
        example: "<Token>"
    })
    rtmToken: string;
    
    @ApiProperty({
        name: "images",
        example: [
            "http://images/image.jpg", 
            "http://images/image.jpg", 
            "http://images/image.jpg", 
            "http://images/image.jpg", 
            "http://images/image.jpg", 
            "http://images/image.jpg"
        ]
    })
    images: string[];
    
    @ApiProperty({
        name: "answerIndex",
        example: 3,
        description: '3번 이미지가 정답'
    })
    answerIndex: number;

    @ApiProperty({
        name: "channelName",
        example: '1'
    })
    channelName: string;
}