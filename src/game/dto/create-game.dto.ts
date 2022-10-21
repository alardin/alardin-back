import { ApiProperty, PickType } from "@nestjs/swagger"
import { IsArray, IsNotEmpty, IsString, IsUrl } from "class-validator";
import { Games } from "src/entities/games.entity"

export class CreateGameDto extends PickType(Games, ['name', 'category', 'price', 'description', 'thumbnail_url', 'min_player', 'max_player']) {
    @ApiProperty({
        name: 'screenshot_urls',
        example: ['https://nestjs.com/img/logo-small.svg', 'https://nestjs.com/img/logo-small.svg']
    })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    screenshot_urls: string[];

    @ApiProperty({
        name: 'keys',
        example: ['keyword', 'images']
    })
    @IsArray()
    @IsString({ each: true })
    keys: string[];

    @ApiProperty({
        name: 'data_keys',
        example: ['is_cleared']
    })
    @IsArray()
    @IsString({ each: true })
    data_keys: string[];

}