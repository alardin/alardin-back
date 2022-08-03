import { Controller, Post, Put, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OnlyStatusResponse } from 'src/common/types/common.responses.type';
import { AlarmService } from './alarm.service';
import { CreateAlarmDto } from './dto/create.alarm.dto';
import { ParticipateInAlarmDto } from './dto/participate.alarm.dto';

@ApiTags('alarm')
@ApiHeader({
    name: 'Authorization',
    example: 'Token'
})
@Controller('alarm')
export class AlarmController {
    constructor(
        private readonly alarmService: AlarmService
    ) {}

    @ApiOperation({
        summary: '새 알람 생성'
    })
    @ApiBody({
        type: CreateAlarmDto
    })
    @ApiResponse({
        status: 201,
        type: OnlyStatusResponse
    })
    @Post()
    makeNewAlarm() {

    }

    @ApiOperation({
        summary: '알람 수정',
    })
    @ApiBody({
        type: CreateAlarmDto
    })
    @ApiResponse({
        status: 200,
        type: OnlyStatusResponse
    })
    @Put()
    editAlarm() {

    }

    @ApiOperation({
        summary: '메이트 알람 참가',
        description: '메이트가 생성한 알람에 참여'
    })
    @ApiBody({
        type: ParticipateInAlarmDto
    })
    @ApiResponse({
        status: 200,
        type: OnlyStatusResponse
    })
    @Post('join')
    participateInAlarm() {
        
    }

}
