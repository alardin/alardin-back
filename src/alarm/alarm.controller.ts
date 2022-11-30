import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { OnlyStatusResponse } from 'src/common/types/common.responses.type';
import { Alarms } from 'src/entities/alarms.entity';
import { SendPushDto } from 'src/push-notification/dto/send-push.dto';
import { JoinedAlarmsDto } from 'src/users/dto/joined-alarms.dto';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AlarmService } from './alarm.service';
import { AlarmUtils } from '../common/utils/alarm.utils';
import { CreateAlarmDto } from './dto/create-alarm.dto';
import { JoinAlarmDto } from './dto/join-alarm.dto';

@ApiTags('alarm')
@Controller('/api/alarm')
export class AlarmController {
  constructor(
    private readonly alarmService: AlarmService,
    private readonly alarmUtils: AlarmUtils,
  ) {}

  @ApiOperation({
    summary: '새 알람 생성',
    description:
      '게임 소유 검증, 알람 생성, 랜덤 키워드에 대한 랜덤 이미지 추출, 푸쉬 알림 전송(구현 안됨)',
  })
  @ApiBody({
    type: CreateAlarmDto,
  })
  @ApiResponse({
    status: 201,
    type: OnlyStatusResponse,
  })
  @Post()
  async createNewAlarm(@User() user, @Body() body: CreateAlarmDto) {
    await this.alarmUtils.clearAlarmsCache(user.id);
    return await this.alarmService.createNewAlarm(user.id, body);
  }

  @ApiOperation({
    summary: '알람 수정',
  })
  @Put(':alarmId')
  async editAlarm(
    @User() user,
    @Param('alarmId') alarmId: number,
    @Body() data: QueryDeepPartialEntity<Alarms>,
  ) {
    await this.alarmUtils.clearAlarmsCache(user.id);
    await this.alarmUtils.deleteMembersCache(user.id, alarmId);
    return await this.alarmService.editAlarm(user, alarmId, data);
  }

  @ApiOperation({
    summary: '메이트 알람 참가',
    description:
      '알람 참여 가능 여부 검증(메이트 관계, 최대 인원 수), 알람 멤버에 추가',
  })
  @ApiBody({
    type: JoinAlarmDto,
  })
  @ApiResponse({
    status: 200,
    type: OnlyStatusResponse,
  })
  @Post('join')
  async joinAlarm(@User() user, @Body() { alarmId }: JoinAlarmDto) {
    await this.alarmUtils.clearAlarmsCache(user.id);
    await this.alarmUtils.deleteMembersCache(user.id, alarmId);
    return await this.alarmService.joinAlarm(user, alarmId);
  }

  @ApiOperation({
    summary: '알람방 나가기',
  })
  @ApiBody({
    type: JoinAlarmDto,
  })
  @Post('quit')
  async quitAlarm(@User() user, @Body('alarmId') alarmId: number) {
    await this.alarmUtils.clearAlarmsCache(user.id);
    await this.alarmUtils.deleteMembersCache(user.id, alarmId);
    return await this.alarmService.quitAlarm(user.id, alarmId);
  }

  @ApiOperation({
    summary: '알람 삭제',
  })
  @ApiResponse({
    status: 200,
    type: OnlyStatusResponse,
  })
  @Delete(':alarmId')
  async deleteAlarm(@User() user, @Param('alarmId') alarmId: number) {
    await this.alarmUtils.clearAlarmsCache(user.id);
    return await this.alarmService.deleteAlarm(user, alarmId);
  }

  @ApiOperation({
    summary: '특정 id의 알람 조회',
  })
  @ApiParam({
    name: 'alarmId',
    example: 1,
  })
  @ApiResponse({
    type: JoinedAlarmsDto,
  })
  @Public()
  @Get(':alarmId')
  async getAlarm(@User() user, @Param('alarmId') alarmId) {
    return await this.alarmService.getValidAlarm(user.id, alarmId);
  }

  @Post('message/host/:alarmId')
  async sendMessageToAlarmByHost(
    @User() user,
    @Param('alarmId') alarmId: number,
    @Body() sendMessageDto: SendPushDto,
  ) {
    return await this.alarmUtils.sendMessageToAlarmByHost(
      user.id,
      alarmId,
      sendMessageDto.title,
      sendMessageDto.body,
      sendMessageDto.data,
    );
  }

  // @Post('message/member/:alarmId')
  // async sendMessageToAlarmByMember(@User() user, @Param('alarmId') alarmId: number, @Body() sendMessageDto: SendPushDto) {
  //     return await this.alarmService.sendMessageToAlarmByMember(user.id, alarmId, sendMessageDto.title, sendMessageDto.body, sendMessageDto.data);
  // }
}
