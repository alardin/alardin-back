import { BadRequestException, Body, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { title } from 'process';
import { In, Repository } from 'typeorm';
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
        const joinedAlarms = await this.alarmsRepository.createQueryBuilder('alarms')
            .innerJoin('alarms.Members', 'members', 'members.id = :myId', { myId: 2 })
            .select([
                'alarms.id',
            ])
            .getMany();
        
        const joinedAlarmsIds = joinedAlarms.map(m => m.id);
        let returnJoinedAlarms = await this.alarmsRepository.find({
            select: {
                id: true,
                name: true,
                time: true,
                is_repeated: true,
                is_private: true,
                music_name: true,
                max_member: true,
                created_at: true,
                Host_id: true,
                Game_id: true,
                Game: {
                    id: true,
                    name: true,
                    thumbnail_url: true
                },
                Host: {
                    id: true,
                    nickname: true,
                    thumbnail_image_url: true
                },
                Members: {
                    id: true,
                    nickname: true,
                    thumbnail_image_url: true,
                }
            },
            where: {
                id: In(joinedAlarmsIds),
            },
            relations: {
                Game: true,
                Members: true,
                Host: true
            }
        });
        returnJoinedAlarms = returnJoinedAlarms.map(({ Host, ...withOutHost}) => {
            withOutHost.Members = withOutHost.Members.filter(m => m.id != Host.id);
            return {...withOutHost, Host};
        })
        const res = returnJoinedAlarms
        return res;
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
