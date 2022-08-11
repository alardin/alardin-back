import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AlarmsDto } from 'src/alarm/dto/alarms.dto';
import { User } from 'src/common/decorators/user.decorator';
import { OnlyStatusResponse } from 'src/common/types/common.responses.type';
import { MateListDto } from './dto/mate-list.dto';
import { MateRequestReponseDto } from './dto/mate-request.response.dto';
import { RemoveMateDto } from './dto/remove.mate.dto';
import { MateService } from './mate.service';

@ApiTags('mate')
@Controller('api/mate')
export class MateController {
    constructor(
        private readonly mateService: MateService
    ) {}

        @ApiOperation({
            summary: '메이트 목록 조회',
            description: '카카오톡 친구 중 메이트 여부 확인 및 앱 설치 여부 확인'
        })
        @ApiResponse({
            type: [MateListDto]
        })
    @Get()
    async getMateList(@User() user) {
        return await this.mateService.getMateList(user.id, user.kakao_access_token);
    }
    
        @ApiOperation({
            summary: '메이트 요청',
            description: '타겟 유저에게 푸쉬 알림 전송, 메시지 ID 리턴'
        })
        @ApiQuery({
            name: 'targetUserId',
            example: 2
        })
        @ApiResponse({
            status: 200,
            description: '성공 시 메세지 ID 리턴',
        })
    @Post()
    async sendMateRequest(@User() user, @Query('targetUserId') targetUserId: number) {
        return await this.mateService.sendMateRequest(user, targetUserId);
    }

        @ApiOperation({
            summary: '메이트 요청에 응답',
            description: '메이트 요청 수락/거절 응답을 통해 메이트 관계 결정'
        })
        @ApiBody({
            type: MateRequestReponseDto
        })
        @ApiResponse({
            status: 200,
            type: OnlyStatusResponse
        })
    @Post()
    async responseToMateRequest(@User() user, @Body() { senderId, response }) {
        return await this.mateService.responseToMateRequest(user, senderId, response);
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
    async removeMate(@User() user, @Body() { mateId }) {
        return await this.mateService.removeMate(user.id, mateId);
    }

        @ApiOperation({
            summary: '메이트들의 알람 조회',
            description: '메이트 관계를 맺고 있는 사람들의 알람 목록 조회'
        })
        @ApiQuery({
            name: 'mateId',
            description: '메이트를 맺고 있는 사람의 id',
            example: '2'
        })
        @ApiResponse({
            status: 200,
            type: [AlarmsDto]
        })
    @Get('alarms')
    async getMateAlarms(@User() user, @Query('mateId') mateId: number) {
        return await this.mateService.getAlarmsofMate(user.id, mateId);
    }


}
