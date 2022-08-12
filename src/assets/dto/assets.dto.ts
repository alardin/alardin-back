import { ApiProperty } from "@nestjs/swagger";
import { Assets } from "src/entities/assets.entity";
import { GameSummaryDto } from "src/game/dto/game-summary.dto";

export class AssetsDto extends Assets {
    @ApiProperty({
        name: 'games',
        description: '구매한 게임 목록',
        type: [GameSummaryDto]
    })
    public games: GameSummaryDto[]


}