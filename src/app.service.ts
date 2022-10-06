import { BadRequestException, Body, Injectable } from '@nestjs/common';
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
        @InjectRepository(Alarms)
        private readonly alarmsRepository: Repository<Alarms>,
        @InjectModel(GameData.name) private gameDataModel: Model<GameDataDocument>,
        @InjectModel(GameMeta.name) private gameMetaModel: Model<GameMetaDocument>,
        @InjectModel(UserPlayData.name) private userPlayDataModel: Model<UserPlayDataDocument>,
        private readonly kakaoService: KakaoService
    ) {}
    async test() {
        const res = await this.gameDataModel.findOne({
            Game_id: 3
        });
        console.log(res);
    }
    async insert(data: InsertDto[]) {
        for await (let d of data) {
            const game = await this.gameMetaModel.findOne({
                Game_id: d.Game_id
            }).exec();
            if (!game) {
                throw new BadRequestException('Invalid Game_id');
            }
            if ( Object.keys(d.data) != game.keys ) {
                throw new BadRequestException('Invalid keys');
            }

            const newGameData = new this.gameDataModel({
                Game_id: d.Game_id,
                data: d.data
            });

            await newGameData.save();

        }
        return 'OK';
    }
}
