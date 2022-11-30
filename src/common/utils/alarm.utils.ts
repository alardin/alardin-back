import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { NotAllowedRequestException } from 'src/common/exceptions/exceptions';
import { Alarms } from 'src/entities/alarms.entity';
import { MateRepository } from 'src/common/repository/mate.repository';
import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { AlarmRepository } from '../repository/alarm.repository';
import { AlarmFindOption } from '../../alarm/alarm.types';

@Injectable()
export class AlarmUtils {
  constructor(
    private readonly pushNotiService: PushNotificationService,
    private readonly alarmRepository: AlarmRepository,
    private readonly mateRepository: MateRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getAlarmMembers({ id }: AlarmFindOption) {
    const { Members } = await this.alarmRepository
      .findDetail({ id })
      .catch(e => {
        throw new InternalServerErrorException();
      });
    return Members;
  }

  async validatePrivateAlarm(userId: number, alarm: Alarms) {
    const validMate = await this.mateRepository.findOneMate({
      myId: userId,
      mateId: alarm.Host_id,
    });
    if (!validMate && alarm.Host_id != userId) {
      throw new NotAllowedRequestException();
    }
  }

  async validateAlarmHost(myId: number, alarmId: number) {
    return await this.alarmRepository.findOne({
      where: {
        Host_id: myId,
        id: alarmId,
      },
    });
  }

  async sendMessageToAlarmByHost(
    myId: number,
    alarmId: number,
    title: string,
    body: string,
    data?: { [key: string]: string },
  ) {
    const members = await this.getAlarmMembers({
      id: alarmId,
    });
    const membersDeviceTokens = members
      .filter(m => m.id !== myId)
      .map(m => m.device_token);
    membersDeviceTokens.length != 0 &&
      (await this.pushNotiService.sendMulticast(
        membersDeviceTokens,
        title,
        body,
        data,
      ));
    return 'OK';
  }

  async sendMessageToAlarmByMember(
    myId: number,
    alarmId: number,
    title: string,
    body: string,
    data?: { [key: string]: string },
  ) {
    const members = await this.getAlarmMembers({
      id: alarmId,
    });
    const memberIds = members.map(m => m.id);
    if (!memberIds.includes(myId)) {
      throw new NotAllowedRequestException();
    }
    const memberDTokens = members
      .filter(m => m.id != myId)
      .map(m => m.device_token);

    memberDTokens.length != 0 &&
      (await this.pushNotiService.sendMulticast(
        memberDTokens,
        title,
        body,
        data,
      ));
    return 'OK';
  }

  async deleteMembersCache(myId: number, alarmId: number) {
    const members = await this.getAlarmMembers({
      id: alarmId,
    });
    const memberIds = members.map(m => m.id);
    memberIds
      .filter(mId => mId != myId)
      .map(async mId => {
        await this.clearAlarmsCache(mId);
      });
  }

  async clearAlarmsCache(myId: number) {
    await this.cacheManager.del(`${myId}_hosted_alarms`);
    await this.cacheManager.del(`${myId}_joined_alarms`);
  }
}
