import { ApiProperty, OmitType, PickType } from "@nestjs/swagger"
import { Games } from "src/entities/games.entity"

export class CreateGameDto extends PickType(Games, ['name', 'category', 'price', 'description', 'thumbnail_url', 'min_player', 'max_player']) {
    @ApiProperty({
        name: 'screenshot_urls',
        example: ['https://nestjs.com/img/logo-small.svg', 'https://nestjs.com/img/logo-small.svg']
    })
    screenshot_urls: string[];
}