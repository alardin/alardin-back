import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, PickType } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { Assets } from 'src/entities/assets.entity';
import { GameSummaryDto } from 'src/game/dto/game-summary.dto';
import { AssetsService } from './assets.service';
import { AssetsDto } from './dto/assets.dto';

@ApiTags('assets')
@Controller('api/assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @ApiOperation({
    summary: '로그인한 사용자의 자산 조회',
    description: '남은 코인, 보유 게임, 프리미엄 여부',
  })
  @ApiResponse({
    status: 200,
    type: AssetsDto,
  })
  @Get()
  async getAssetAndOwnedGames(@User() user) {
    return await this.assetsService.getAssetAndOwnedGames(user.id);
  }

  @ApiOperation({
    summary: '로그인한 사용자의 남은 코인 조회',
    description: '사용자의 남은 코인 조회',
  })
  @ApiResponse({
    status: 200,
    type: PickType(Assets, ['coin']),
  })
  @Get('coin')
  async getCoinAmount(@User() user) {
    return await this.assetsService.getCoinAmount(user.id);
  }

  @ApiOperation({
    summary: '구매한 게임 목록 조회',
  })
  @ApiResponse({
    status: 200,
    type: [GameSummaryDto],
  })
  @Get('games')
  async getGames(@User() user) {
    return await this.assetsService.getOwnedGames(user.id);
  }

  @ApiOperation({
    summary: '프리미엄 여부 확인',
    description: '프리미엄 여부 true or false',
  })
  @ApiResponse({
    status: 200,
    type: PickType(Assets, ['is_premium']),
  })
  @Get('premium')
  async getPremiumInfo(@User() user) {
    return await this.assetsService.getIsPremium(user.id);
  }

  /**
   * 이 아래는 전부 only service
   */

  // @ApiOperation({
  //     summary: '충전/구매에 의한 코인량 변화'
  // })
  // @ApiBody({
  //     type: ChangeCoinDto
  // })
  // @ApiResponse({
  //     status: 200,
  //     type: OnlyStatusResponse
  // })
  // @Put('coin')
  // changeCoinAmount() {

  // }

  // @ApiOperation({
  //     summary: '프리미엄 업그레이드',
  //     description: '로그인한 사용자를 프리미엄으로 업그레이드함'
  // })
  // @ApiResponse({
  //     status: 200,
  //     type: OnlyStatusResponse
  // })
  // @Put('premium')
  // upgradeToPremium() {

  // }

  // @ApiOperation({
  //     summary: '일반유저로 디그레이드',
  //     description: '로그인한 사용자를 프리미엄에서 일반유저로 디그레이드함'
  // })
  // @ApiResponse({
  //     status: 200,
  //     type: OnlyStatusResponse
  // })
  // @Delete('premium')
  // degradeFromPremium() {

  // }
}
