import { ApiProperty, PickType } from "@nestjs/swagger"
import { IsArray, IsNotEmpty, IsString, IsUrl } from "class-validator";
import { Games } from "src/entities/games.entity"

export class CreateGameDto extends PickType(Games, ['name', 'category', 'price', 'description', 'thumbnail_url', 'min_player', 'max_player']) {
    @ApiProperty({
        name: 'screenshot_urls',
        example: ['https://nestjs.com/img/logo-small.svg', 'https://nestjs.com/img/logo-small.svg']
    })
    @IsArray()
    @IsUrl({ each: true })
    @IsNotEmpty()
    screenshot_urls: string[];

    @ApiProperty({
        name: 'data_type',
        example: 'image'
    })
    @IsString()
    data_type: 'image' | 'text';

    @ApiProperty({
        name: 'keys',
        example: ['keyword', 'images']
    })
    @IsArray()
    @IsString()
    keys: string[];

}