import { CACHE_MANAGER, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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
import { MessagingPayload } from 'firebase-admin/lib/messaging/messaging-api';
import * as admin from 'firebase-admin';
import { PushNotificationService } from './push-notification/push-notification.service';
import { InjectModel } from '@nestjs/mongoose';
import { GameMeta, GameMetaDocument } from './schemas/gameMeta.schemas';
import { Model } from 'mongoose';
@Injectable()
export class AppService {
    constructor(
        private readonly pushNotiService: PushNotificationService,
        @InjectModel(GameMeta.name) private readonly gameMetasModel: Model<GameMetaDocument>
    ) {
        
    }
    async test() {
        const { data_keys } = await this.gameMetasModel.findOne({ Game_id: 1}).exec();
        return data_keys;
    }
}
