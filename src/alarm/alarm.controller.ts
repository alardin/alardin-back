import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { get } from 'http';
import { userInfo } from 'os';
import { User } from 'src/common/decorators/user.decorator';
import { OnlyStatusResponse } from 'src/common/types/common.responses.type';
import { SendPushDto } from 'src/push-notification/dto/send-push.dto';
import { JoinedAlarmsDto } from 'src/users/dto/joined-alarms.dto';
import { AlarmService } from './alarm.service';
import { CreateAlarmDto } from './dto/create-alarm.dto';
import { JoinAlarmDto } from './dto/join-alarm.dto';

@ApiTags('alarm')
@Controller('/api/alarm')
export class AlarmController {
    constructor(
        private readonly alarmService: AlarmService
    ) {}

        @ApiOperation({
            summary: '새 알람 생성',
            description: '게임 소유 검증, 알람 생성, 랜덤 키워드에 대한 랜덤 이미지 추출, 푸쉬 알림 전송(구현 안됨)'
        })
        @ApiBody({
            type: CreateAlarmDto
        })
        @ApiResponse({
            status: 201,
            type: OnlyStatusResponse
        })
    @Post()
    async createNewAlarm(@User() user, @Body() body: CreateAlarmDto) {
        return await this.alarmService.createNewAlarm(user.id, body);
    }

        @ApiOperation({
            summary: '알람 수정',
            description: 'developing'
        })
    @Put()
    editAlarm() {

    }

        @ApiOperation({
            summary: '메이트 알람 참가',
            description: '알람 참여 가능 여부 검증(메이트 관계, 최대 인원 수), 알람 멤법에 추가'
        })
        @ApiBody({
            type: JoinAlarmDto
        })
        @ApiResponse({
            status: 200,
            type: OnlyStatusResponse
        })
    @Post('join')
    async joinAlarm(@User() user, @Body() { alarmId }: JoinAlarmDto) {
        return await this.alarmService.joinAlarm(user, alarmId);
    }


        @ApiOperation({
            summary: '알람 삭제',
        })
        @ApiResponse({
            status: 200,
            type: OnlyStatusResponse
        })
    @Delete(':alarmId')
    async deleteAlarm(@User() user, @Param('alarmId') alarmId: number) {
        return await this.alarmService.deleteAlarm(user.id, alarmId); 
    }

        @ApiOperation({
            summary: '특정 id의 알람 조회'
        })
        @ApiParam({
            name: 'alarmId',
            example: 1
        })
        @ApiResponse({
            type: JoinedAlarmsDto
        })
    @Get(':alarmId')
    async getAlarm(@User() user, @Param('alarmId') alarmId) {
        return await this.alarmService.getAlarm(user.id, alarmId);
    }

    @Post('message/:alarmId')
    async sendMessageToAlarm(@User() user, @Param('alarmId') alarmId: number, @Body() sendMessageDto: SendPushDto) {
        return await this.alarmService.sendMessageToAlarm(user.id, alarmId, sendMessageDto.title, sendMessageDto.body, sendMessageDto.data);
    }

}
