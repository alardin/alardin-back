import { Controller, Delete, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChangeCoinDto } from 'src/assets/dto/change.coin.dto';
import { InternalGuard } from 'src/common/guards/internal.guard';
import { OnlyStatusResponse } from 'src/common/types/common.responses.type';

@ApiTags('internal/assets (컨트롤러 삭제 예정)')
@UseGuards(InternalGuard)
@Controller('api/internal/assets')
export class AssetController {
    
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
