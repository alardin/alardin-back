import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlarmMembers } from './entities/alarm.members.entity';
import { Alarms } from './entities/alarms.entity';
import { KakaoService } from './external/kakao/kakao.service';
import { Mates } from './entities/mates.entity';
import { MateService } from './mate/mate.service';
import { AlarmService } from './alarm/alarm.service';
import { MateRequestRecords } from './entities/mate-request.records.entity';
import { Games } from './entities/games.entity';
import { UsersService } from './users/users.service';
import { Users } from './entities/users.entity';
import { Cache } from 'cache-manager';
import { GameService } from './game/game.service';

@Injectable()
export class AppService {
    constructor(
        @InjectRepository(Games)
        private readonly gamesRepository: Repository<Games>,
        @InjectRepository(AlarmMembers)
        private readonly alarmMembersRepository: Repository<AlarmMembers>,
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(Mates)
        private readonly matesRepository: Repository<Mates>,
        @InjectRepository(MateRequestRecords)
        private readonly mateReqRepository: Repository<MateRequestRecords>,
        @InjectRepository(Alarms)
        private readonly alarmsRepository: Repository<Alarms>,
        private readonly kakaoService: KakaoService,
        private readonly mateService: MateService,
        private readonly usersService: UsersService,
        private readonly alarmService: AlarmService,
        private readonly gameService: GameService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {
    }
    async test() {
        const res = await this.gameService.saveGame(2, {
            "Alarm_id": 51,
            "Game_id": 2,
            "data": {
              "data": {
                "next_read": 2
              },
              "play_time": 12,
              "trial": 0
            },
            "end_time": new Date(),
            "is_cleared": true,
            "start_time": new Date()
          });
        return res; 
    }
}
