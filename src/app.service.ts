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
        await this.kakaoService.refreshKakaoTokens('dtV0HaMtffjt9-H1bsrdFoBCf1eSllDYi2frd3x4Cj1zFwAAAYOnE27m');
        // const alarmMembers = await this.alarmMembersRepository.find({
        //     where: { Alarm_id: 29 },
        //     select: {
        //         User_id: true
        //     }
        // });
        // const res = await this.gameDataModel.aggregate([
        //     { $match: { $and: [ { Game_id: 2 }, { data_type: 'text' } ] } },
        //     { $sample: { size: 2 } },
        //     { $project: { "data": true, "keys": true } }
        // ]);
        // console.log(res[0].data);
        // const memberIds = alarmMembers.map(m => m.User_id);
        
    }
}
