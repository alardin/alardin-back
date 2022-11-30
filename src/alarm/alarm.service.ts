import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NotAllowedRequestException } from 'src/common/exceptions/exceptions';
import { QueryRunnerProvider } from 'src/db/query-runner/query-runner';
import { Alarms } from 'src/entities/alarms.entity';
import { GameChannel } from 'src/entities/game.channel.entity';
import { Users } from 'src/entities/users.entity';
import { GameUtils } from 'src/common/utils/game.utils';
import { GameRepository } from 'src/common/repository/game.repository';
import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { DataSource } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AlarmRepository } from '../common/repository/alarm.repository';
import { AlarmUtils } from '../common/utils/alarm.utils';
import { CreateAlarmDto } from './dto/create-alarm.dto';

@Injectable()
export class AlarmService {
  constructor(
    private readonly alarmRepository: AlarmRepository,
    private readonly gameRepository: GameRepository,
    private readonly gameUtils: GameUtils,
    private readonly queryRunnerProvider: QueryRunnerProvider,
    private readonly alarmUtils: AlarmUtils,
    private dataSource: DataSource,
    private readonly pushNotiService: PushNotificationService,
  ) {}

  async getValidAlarm(myId: number, alarmId: number) {
    const alarm = await this.alarmRepository
      .findDetail({ id: alarmId })
      .catch(_ => {
        throw new NotFoundException();
      });
    if (alarm.is_private) {
      await this.alarmUtils.validatePrivateAlarm(myId, alarm);
    }
    return alarm;
  }

  async createNewAlarm(myId: number, body: CreateAlarmDto) {
    const isOwned = this.gameUtils.validGameOwnership(myId, body.Game_id);
    if (!isOwned) {
      throw new NotAllowedRequestException();
    }

    const game = await this.gameRepository
      .findById({ id: body.Game_id })
      .catch(e => {
        throw new BadRequestException();
      });

    if (body.max_member > game.max_player) {
      throw new NotAllowedRequestException();
    }
    const entityManager = await this.queryRunnerProvider.init();

    try {
      const newAlarm = entityManager.create(Alarms, {
        Host_id: myId,
        member_count: 1,
        min_member: game.min_player,
        ...body,
      });
      await entityManager.save(newAlarm);

      await this.alarmRepository.saveMember({
        alarmId: newAlarm.id,
        userId: myId,
        entityManager,
      });

      const newChannel = entityManager.create(GameChannel, {
        id: newAlarm.id,
        name: String(newAlarm.id),
        Alarm_id: newAlarm.id,
        player_count: 0,
      });
      await entityManager.save(newChannel);

      await entityManager.update(
        Alarms,
        { id: newAlarm.id },
        { Game_channel_id: newChannel.id },
      );

      await this.queryRunnerProvider.releaseWithCommit();
    } catch (e) {
      await this.queryRunnerProvider.releaseWithRollback();
      throw new InternalServerErrorException();
    }
    await this.alarmUtils.clearAlarmsCache(myId);
    return 'OK';
  }

  async editAlarm(
    me: Users,
    alarmId: number,
    condition: QueryDeepPartialEntity<Alarms>,
  ) {
    const alarm = await this.alarmRepository
      .findById({ id: alarmId })
      .catch(e => {
        throw new BadRequestException();
      });
    if (me.id !== alarm.Host_id) {
      throw new NotAllowedRequestException();
    }

    try {
      await this.alarmRepository.update({ id: alarm.id }, condition);
      await this.alarmUtils.sendMessageToAlarmByHost(
        me.id,
        alarm.id,
        `${me.nickname}님께서 ${alarm.time} 알람방을 수정했습니다.`,
        `${alarm.time} 알람 수정 발생`,
        {
          type: 'ROOM_ALARM',
          message: JSON.stringify({
            type: 'room',
            content: `${me.nickname}님께서 ${alarm.time} 알람방을 수정했습니다.`,
            date: new Date(Date.now()).toISOString(),
          }),
        },
      );
    } catch (e) {
      throw new InternalServerErrorException();
    }
    return 'OK';
  }

  async joinAlarm(me: Users, alarmId: number) {
    const alarm = await this.alarmRepository
      .findById({ id: alarmId })
      .catch(e => {
        throw new BadRequestException();
      });
    if (alarm.member_count >= alarm.max_member) {
      throw new NotAllowedRequestException();
    }
    const alarmMembers = await this.alarmUtils.getAlarmMembers({
      id: alarm.id,
    });

    const alreadyJoined = alarmMembers.find(m => m.id == me.id);
    if (alreadyJoined) {
      throw new NotAllowedRequestException();
    }

    if (alarm.is_private) {
      await this.alarmUtils.validatePrivateAlarm(me.id, alarm);
    }

    const entityManager = await this.queryRunnerProvider.init();
    try {
      await this.alarmRepository.addMember({
        alarmId: alarm.id,
        userId: me.id,
        entityManager,
      });
      await this.queryRunnerProvider.releaseWithCommit();
    } catch (e) {
      await this.queryRunnerProvider.releaseWithRollback();
      throw new InternalServerErrorException();
    }

    await this.alarmUtils.sendMessageToAlarmByMember(
      me.id,
      alarm.id,
      `${me.nickname}님께서 ${alarm.time} 알람방에 참가하였습니다.`,
      `${me.nickname}님의 알람방 참가`,
      {
        type: 'ROOM_ALARM',
        message: JSON.stringify({
          type: 'room',
          content: `${me.nickname}님께서 ${alarm.time} 알람방에 참가하였습니다.`,
          date: new Date(Date.now()).toISOString(),
        }),
      },
    );
    return 'OK';
  }

  async quitAlarm(myId: number, alarmId: number) {
    // valid member
    const alarm = await this.alarmRepository
      .findById({ id: alarmId })
      .catch(e => {
        throw new BadRequestException();
      });
    const entityManager = await this.queryRunnerProvider.init();

    try {
      await this.alarmRepository.quitMember({
        alarmId: alarm.id,
        userId: myId,
        entityManager,
      });
      await this.queryRunnerProvider.releaseWithCommit();
    } catch (e) {
      await this.queryRunnerProvider.releaseWithRollback();
      throw new InternalServerErrorException();
    }

    return 'OK';
  }

  async deleteAlarm(me: Users, alarmId: number) {
    const isHost = await this.alarmUtils.validateAlarmHost(me.id, alarmId);
    if (!isHost) {
      throw new ForbiddenException();
    }
    const alarm = await this.alarmRepository
      .findById({ id: alarmId })
      .catch(_ => {
        throw new BadRequestException();
      });
    const members = await this.alarmUtils.getAlarmMembers({
      id: alarmId,
    });
    const memberIds = members.map(m => m.id).filter(mId => mId != me.id);
    const membersDeviceTokens = members.map(m => m.device_token);
    memberIds.map(async mId => {
      await this.alarmUtils.clearAlarmsCache(mId);
    });
    try {
      await this.alarmRepository.softDelete({ id: alarm.id });

      membersDeviceTokens.length != 0 &&
        (await this.pushNotiService.sendMulticast(
          membersDeviceTokens,
          `${me.nickname}님께서 ${alarm.time} 알람방을 삭제했습니다.`,
          `방장이 ${alarm.time} 알람을 삭제했습니다`,
          {
            type: 'ROOM_ALARM',
            message: JSON.stringify({
              type: 'room',
              content: `${me.nickname}님께서 ${alarm.time} 알람방을 삭제했습니다.`,
              date: new Date(Date.now()).toISOString(),
            }),
          },
        ));
    } catch (e) {
      throw new NotAllowedRequestException();
    }
    return 'OK';
  }
}
