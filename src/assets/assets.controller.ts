import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags, PickType } from '@nestjs/swagger';
import { Assets } from 'src/entities/assets.entity';
import { GameSummaryDto } from 'src/game/dto/game.summary.dto';
import { AssetsService } from './assets.service';
import { AssetsDto } from './dto/assets.dto';

@ApiTags('assets')
@ApiHeader({
    name: 'Authorization',
    example: 'Token'
})
@Controller('api/assets')
export class AssetsController {
    constructor(
        private readonly assetsService: AssetsService
    ) {}
    
    @ApiOperation({
        summary: '로그인한 사용자의 자산 조회',
        description: '남은 코인, 보유 게임, 프리미엄 여부'
    })
    @ApiResponse({
        status: 200,
        type: AssetsDto
    })
    @Get()
    getUserAssets() {

    }

    @ApiOperation({
        summary: '로그인한 사용자의 남은 코인 조회'
    })
    @ApiResponse({
        status: 200,
        type: PickType(Assets, ['coin'])
    })
    @Get('coin')
    getCoinAmount() {

    }

    @ApiOperation({
        summary: '구매한 게임 목록 조회',
    })
    @ApiResponse({
        status: 200,
        type: [GameSummaryDto]
    })
    @Get('games')
    getGames() {

    }

    @ApiOperation({
        summary: '프리미엄 여부 확인'
    })
    @ApiResponse({
        status: 200,
        type: PickType(Assets, ['is_premium'])
    })
    @Get('premium')
    getPremiumInfo() {

    }
}
