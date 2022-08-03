import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AlarmsDto } from 'src/alarm/dto/alarms.dto';
import { User } from 'src/common/decorators/user.decorator';
import { OnlyStatusResponse } from 'src/common/types/common.responses.type';
import { MateRequestReponseDto } from './dto/mate-request.response.dto';
import { RemoveMateDto } from './dto/remove.mate.dto';
import { MateService } from './mate.service';

@ApiTags('mate')
@ApiHeader({
    name: 'Authorization',
    example: 'Token'
})
@Controller('api/mate')
export class MateController {
    constructor(
        private readonly mateService: MateService
    ) {}

        @ApiOperation({
            summary: '메이트 목록 조회',
            description: '카카오톡 친구 중 메이트 여부 확인 및 앱 설치 여부 확인'
        })
    @Get()
    getMateList(@User() user) {
        return this.mateService.getMateList(user.id);
    }
    
        @ApiOperation({
            summary: '메이트 요청',
        })
    @Post()
    sendMateRequest(@User() user, targetUserId: number) {
        this.mateService.sendMateRequest(user, targetUserId);
    }

        @ApiOperation({
            summary: '메이트 요청에 응답',
            description: '메이트 요청 수락/거절 응답을 통해 메이트 관계 결정'
        })
        @ApiBody({
            type: MateRequestReponseDto
        })
        @ApiResponse({
            type: OnlyStatusResponse
        })
    @Post()
    responseToMateRequest(@User() user, @Body() { senderId, response }) {
        return this.mateService.responseToMateRequest(user, senderId, response);
    }

        @ApiOperation({
            summary: '메이트 제거',
            description: '메이트 관계 종료'
        })
        @ApiBody({
            type: RemoveMateDto,
        })
        @ApiResponse({
            status: 200,
            type: OnlyStatusResponse
        })
    @Delete()
    removeMate(@User() user, @Body() { mateId }) {
        this.mateService.removeMate(user.id, mateId);
    }

        @ApiOperation({
            summary: '메이트들의 알람 조회',
            description: '메이트 관계를 맺고 있는 사람들의 알람 목록 조회'
        })
        @ApiResponse({
            status: 200,
            type: [AlarmsDto]
        })
    @Get('alarms')
    async getMateAlarms(@User() user, mateId: number) {
        return await this.mateService.getMateHostAlarms(user.id, mateId);
    }



}
