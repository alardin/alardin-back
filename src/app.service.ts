import { BadRequestException, Body, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { FindOptionsSelect, FindOptionsWhere, ILike, In, LessThan, MoreThan, Repository } from 'typeorm';
import { AlarmMembers } from './entities/alarm.members.entity';
import { Alarms } from './entities/alarms.entity';
import { KakaoService } from './external/kakao/kakao.service';
import { GameData, GameDataDocument } from './schemas/gameData.schemas';
import { UserPlayData, UserPlayDataDocument } from './schemas/userPlayData.schemas';
import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GameMeta, GameMetaDocument } from './schemas/gameMeta.schemas';
import { Mates } from './entities/mates.entity';
import { MateService } from './mate/mate.service';
import { AlarmService } from './alarm/alarm.service';
import { MateRequestRecords } from './entities/mate-request.records.entity';
import { Games } from './entities/games.entity';
import { UsersService } from './users/users.service';
import { Users } from './entities/users.entity';

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
        @InjectModel(GameData.name) private gameDataModel: Model<GameDataDocument>,
        @InjectModel(GameMeta.name) private gameMetaModel: Model<GameMetaDocument>,
        @InjectModel(UserPlayData.name) private userPlayDataModel: Model<UserPlayDataDocument>,
        private readonly kakaoService: KakaoService,
        private readonly mateService: MateService,
        private readonly usersService: UsersService,
        private readonly alarmService: AlarmService,
    ) {
    }
    async test() {
        const gameDatas = await this.gameDataModel
            .aggregate([
                { $match: { Game_id: 1 } },
                { $sample: { size: 1 } },
                { $project: { data: true } },
            ])
            .exec();
        return gameDatas;
        
    }
    // async insert(data: InsertDto[]) {
    //     for await (let d of data) {
    //         const game = await this.gameMetaModel.findOne({
    //             Game_id: d.Game_id
    //         }).exec();
    //         if (!game) {
    //             throw new BadRequestException('Invalid Game_id');
    //         }
    //         if ( !Object.keys(d.data).every((k) => game.keys.includes(k)) || !game.keys.every((k) => Object.keys(d.data).includes(k))) {
    //             throw new BadRequestException('Invalid keys');
    //         }

    //         const newGameData = new this.gameDataModel({
    //             Game_id: d.Game_id,
    //             data: d.data
    //         });

    //         await newGameData.save();

    //     }
    //     return 'OK';
    // }
}
