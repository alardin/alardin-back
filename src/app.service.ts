import { BadRequestException, Body, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { title } from 'process';
import { Repository } from 'typeorm';
import { AlarmMembers } from './entities/alarm.members.entity';
import { Alarms } from './entities/alarms.entity';
import { KakaoService } from './external/kakao/kakao.service';
import { GameData, GameDataDocument } from './schemas/gameData.schemas';
import { UserPlayData, UserPlayDataDocument } from './schemas/userPlayData.schemas';
import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GameMeta, GameMetaDocument } from './schemas/gameMeta.schemas';
import { Mates } from './entities/mates.entity';
import { filter } from 'rxjs';
import { MateService } from './mate/mate.service';
import { AlarmService } from './alarm/alarm.service';


class InsertDto {
    @ApiProperty({
        name: 'Game_id',
        example: 1
    })
    @IsNumber()
    @IsNotEmpty()
    Game_id: number;


    @ApiProperty({
        name: 'data',
        example: {
            title: '좋아한다는 착각2',
            paragraphs: [
              { paragraph_idx: 1, contents: 'test contents' },
              { paragraph_idx: 2, contents: 'test contents2' }
            ]
        }
    })
    @IsObject()
    @IsNotEmpty()
    data: object;
  
}


@Injectable()
export class AppService {
    constructor(
        @InjectRepository(AlarmMembers)
        private readonly alarmMembersRepository: Repository<AlarmMembers>,
        @InjectRepository(Mates)
        private readonly matesRepository: Repository<Mates>,
        @InjectRepository(Alarms)
        private readonly alarmsRepository: Repository<Alarms>,
        @InjectModel(GameData.name) private gameDataModel: Model<GameDataDocument>,
        @InjectModel(GameMeta.name) private gameMetaModel: Model<GameMetaDocument>,
        @InjectModel(UserPlayData.name) private userPlayDataModel: Model<UserPlayDataDocument>,
        private readonly kakaoService: KakaoService,
        private readonly mateService: MateService,
        private readonly alarmService: AlarmService,
    ) {}
    async test() {
        // if (!members) {
        //     throw new ForbiddenException();
        // }
        // const memberIds = members.filter((m) => m.id !== 2).map(m => m.id);
        // if (!memberIds.includes(2)) {
        //     throw new ForbiddenException();
        // }
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
