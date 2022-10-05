import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { AlarmMembers } from './entities/alarm.members.entity';
import { Alarms } from './entities/alarms.entity';
import { KakaoService } from './external/kakao/kakao.service';
import { GameData, GameDataDocument } from './schemas/gameData.schemas';

@Injectable()
export class AppService {
    constructor(
        @InjectRepository(AlarmMembers)
        private readonly alarmMembersRepository: Repository<AlarmMembers>,
        @InjectRepository(Alarms)
        private readonly alarmsRepository: Repository<Alarms>,
        @InjectModel(GameData.name) private gameDataModel: Model<GameDataDocument>,
        private readonly kakaoService: KakaoService
    ) {}
    async test() {
        
    }
}
