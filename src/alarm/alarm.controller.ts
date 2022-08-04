import { Body, Controller, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { userInfo } from 'os';
import { User } from 'src/common/decorators/user.decorator';
import { OnlyStatusResponse } from 'src/common/types/common.responses.type';
import { AlarmService } from './alarm.service';
import { CreateAlarmDto } from './dto/create-alarm.dto';
import { JoinAlarmDto } from './dto/join-alarm.dto';

@ApiTags('alarm')
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
    async createNewAlarm(@User() user, body: CreateAlarmDto) {
        return await this.alarmService.createNewALarm(user.id, body);
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
        type: JoinAlarmDto
    })
    @ApiResponse({
        status: 200,
        type: OnlyStatusResponse
    })
    @Post('join')
    async joinAlarm(@User() user, @Body() { alarmId }: JoinAlarmDto) {
        return await this.alarmService.joinAlarm(user.id, alarmId);
    }

}
