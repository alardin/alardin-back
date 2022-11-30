import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AlarmRepository } from './common/repository/alarm.repository';
import { AlarmService } from './alarm/alarm.service';

@Injectable()
export class AppService {
  constructor(private readonly alarmService: AlarmService) {}
  async test() {
    return await this.alarmService.createNewAlarm(21, {
      name: 'alarm 1',
      time: '15:30',
      is_repeated: '123',
      is_private: false,
      music_name: 'Cooped Up',
      music_volume: 70,
      max_member: 2,
      expired_at: new Date(),
      Game_id: 1,
    });
  }
}
