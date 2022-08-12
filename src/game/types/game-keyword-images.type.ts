import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class GameKeywordImages {
    @ApiProperty({
        name: 'keyword',
        example: 'sleeping cat'
    })
    @IsString()
    @IsNotEmpty()
    keyword: string;
    
    @ApiProperty({
        name: 'images',
        example: ['http://aadfad/img.jpg', 'http://asdfiamdfadf/img2.jpg']
    })
    @IsNotEmpty()
    images: string[];
} 