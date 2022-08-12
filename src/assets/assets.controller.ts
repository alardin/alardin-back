import { Controller, Delete, Get, Put, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags, PickType } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { OnlyStatusResponse } from 'src/common/types/common.responses.type';
import { Assets } from 'src/entities/assets.entity';
import { GameSummaryDto } from 'src/game/dto/game-summary.dto';
import { AssetsService } from './assets.service';
import { AssetsDto } from './dto/assets.dto';
import { ChangeCoinDto } from './dto/change.coin.dto';

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
    getAssetAndOwnedGames(@User() user) {
        this.assetsService.getAssetAndOwnedGames(user.id);
    }

    @ApiOperation({
        summary: '로그인한 사용자의 남은 코인 조회'
    })
    @ApiResponse({
        status: 200,
        type: PickType(Assets, ['coin'])
    })
    @Get('coin')
    getCoinAmount(@User() user) {
        this.assetsService.getCoinAmount(user.id);
    }

    @ApiOperation({
        summary: '구매한 게임 목록 조회',
    })
    @ApiResponse({
        status: 200,
        type: [GameSummaryDto]
    })
    @Get('games')
    getGames(@User() user) {
        this.assetsService.getOwnedGames(user.id);
    }

    @ApiOperation({
        summary: '프리미엄 여부 확인'
    })
    @ApiResponse({
        status: 200,
        type: PickType(Assets, ['is_premium'])
    })
    @Get('premium')
    getPremiumInfo(@User() user) {
        this.assetsService.getIsPremium(user.id);
    }

    /**
     * 이 아래는 전부 only service
     */
    
    @ApiOperation({
        summary: '충전/구매에 의한 코인량 변화'
    })
    @ApiBody({
        type: ChangeCoinDto
    })
    @ApiResponse({
        status: 200,
        type: OnlyStatusResponse
    })
    @Put('coin') 
    changeCoinAmount() {

    }

    @ApiOperation({
        summary: '프리미엄 업그레이드',
        description: '로그인한 사용자를 프리미엄으로 업그레이드함'
    })
    @ApiResponse({
        status: 200,
        type: OnlyStatusResponse
    })
    @Put('premium')
    upgradeToPremium() {

    }

    @ApiOperation({
        summary: '일반유저로 디그레이드',
        description: '로그인한 사용자를 프리미엄에서 일반유저로 디그레이드함'
    })
    @ApiResponse({
        status: 200,
        type: OnlyStatusResponse
    })
    @Delete('premium')
    degradeFromPremium() {

    }

}
