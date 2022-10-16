import { CACHE_MANAGER, ForbiddenException, Inject, Injectable, Logger, LoggerService, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Alarms } from 'src/entities/alarms.entity';
import { MateRequestRecords } from 'src/entities/mate-request.records.entity';
import { Mates } from 'src/entities/mates.entity';
import { Users } from 'src/entities/users.entity';
import { KakaoService } from 'src/external/kakao/kakao.service';
import { KakaoFriend } from 'src/external/kakao/kakao.types';
import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { UsersService } from 'src/users/users.service';
import { FindOptionsSelect, FindOptionsWhere, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';


type TMateList = {
    mates: Users[];
    kakaoFriends: KakaoFriend[];
}


@Injectable()
export class MateService {
    constructor(
        private readonly pushNotiService: PushNotificationService,
        private readonly kakaoService: KakaoService,
        @InjectRepository(Mates)
        private readonly matesRepository: Repository<Mates>,
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(MateRequestRecords)
        private readonly mateReqRepository: Repository<MateRequestRecords>,
        private readonly usersService: UsersService,
        @InjectRepository(Alarms)
        private readonly alarmsRepository: Repository<Alarms>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @Inject(Logger) private readonly logger: LoggerService,
    ) {
    }

    async getMateList(myId: number, kakaoAccessToken: string):Promise<TMateList> {

        const receivedMates = await this.matesRepository.createQueryBuilder('m')
                                    .innerJoinAndSelect('m.Receiver', 'r', 'r.id = :myId', { myId })
                                    .innerJoin('m.Sender', 's')
                                    .select([
                                        'm.id',
                                        's.id',
                                        's.nickname',
                                        's.thumbnail_image_url',
                                        's.kakao_id'
                                    ])
                                    .getMany();

        const sendedMates = await this.matesRepository.createQueryBuilder('m')
                                    .innerJoinAndSelect('m.Sender', 's', 's.id = :myId', { myId })
                                    .innerJoin('m.Receiver', 'r')
                                    .select([
                                        'm.id',
                                        's.id',
                                        'r.id',
                                        'r.nickname',
                                        'r.thumbnail_image_url',
                                        'r.kakao_id'
                                    ])
                                    .getMany();
                                    
        const usersOfMateIReceived = receivedMates.map(m => m.Sender);
        const usersOfMateISended = sendedMates.map(m => m.Receiver);

        const friends = await this.kakaoService.getKakaoFriends(kakaoAccessToken);
        const mateFinished = [ ...usersOfMateIReceived, ...usersOfMateISended];
        const mateIds = mateFinished.map(m => m.id);
        const joinedAlarms = await this.usersService.getUsersJoinedAlarm(myId);
        const hostedAlarms = await this.usersService.getUsersHostedAlarm(myId);
        const myAlarms = [...joinedAlarms, ...hostedAlarms];
        for await (let mId of mateIds) {
            let alarmCount = 0;
            for await (let alarm of myAlarms) {
                alarmCount = Number(alarm.Members.map(m => m.id).includes(mId));
            }
            // mateFinished에 추가
        }
        await this.cacheManager.set(`${myId}_mates`, {
            mates: mateFinished,
            kakaoFriends: friends  
        }, { ttl: 60 * 60 * 24 });
        return {
            mates: mateFinished,
            kakaoFriends: friends  
        };
    }

    async sendMateRequest(me: Users, receiverKakaoId: number) {
        if (!receiverKakaoId) {
            return null;
        }
        const receiver = await this.usersRepository.findOneOrFail({ where: { kakao_id: receiverKakaoId }})
                                .catch(_ => { throw new NotFoundException() });
        const newMateReq = new MateRequestRecords()
        newMateReq.Sender_id = me.id;
        newMateReq.Receiver_id = receiver.id;
        newMateReq.is_accepted = false, newMateReq.is_rejected = false;
        await this.mateReqRepository.save(newMateReq);

        await this.pushNotiService.sendPush(receiver.id, receiver.device_token, 
            `${me.nickname}님의 메이트를 요청`, 
            `${me.nickname}님께서 회원님과의 메이트를 요청하셨습니다.`, 
            {
                type: "MATE_ALARM",
                message: JSON.stringify({
                        type: 'mate',
                        content: `${me.nickname}님께서 회원님과의 메이트를 요청하셨습니다.`,
                        date: new Date(Date.now()).toISOString(),
                        id: me.id,   // number
                        nickname: me.nickname,  // string
                        thumbnail_image_url: me.thumbnail_image_url,
                }),
            }
        );
        return 'OK';
    }

    async responseToMateRequest(me: Users, senderId: number, response: string) {
        // if ok -> mate db save, 요청자에게 push
        if (!senderId) {
            return null
        }
        const mateReq = await this.mateReqRepository.findOneOrFail({ where: { Sender_id: senderId }})
            .catch(_ => { throw new ForbiddenException() });

        const sender = await this.getUserByUserId(mateReq.Sender_id);

        switch(response) {
            case 'ACCEPT':
                await this.updateMateRequest(me.id, sender.id, true);
                await this.saveMate(sender.id, me.id);
                await this.pushNotiService.sendPush(sender.id, sender.device_token, 
                    `${me.nickname}님과 메이트 수락`, 
                    `${me.nickname}님께서 회원님과의 메이트를 수락했습니다.`,
                    {
                        type: "MATE_ALARM",
                        message: JSON.stringify({
                            type: 'mate',
                            content: `${me.nickname}님께서 회원님과의 메이트를 수락했습니다.`,
                            date: new Date(Date.now()).toISOString(),
                            id: me.id,   // number
                            nickname: me.nickname,  // string
                            thumbnail_image_url: me.thumbnail_image_url,
                        }),
                    }
                );
                await this.cacheManager.del(`${me.id}_mates`);
                break;
            case 'REJECT':
                await this.updateMateRequest(me.id, sender.id, false);
                break;
            default:
                break;
        }

        return 'OK';
 
    }

    async getMateRequestList(me: Users) {
        let whereOption: FindOptionsWhere<MateRequestRecords> = { is_accepted: false, is_rejected: false };
        let userOption: FindOptionsSelect<Users> = { id: true, nickname: true, thumbnail_image_url: true };
        const requests = await this.mateReqRepository.find({
            select: {
                Receiver: userOption,
                sended_at: true,
            },
            where: {
                Sender_id: me.id,
                ...whereOption
            },
            relations: {
                Receiver: true
            }
        });
        const responses = await this.mateReqRepository.find({
            select: {
                Sender:userOption,
                sended_at: true,
            },
            where: {
                Receiver_id: me.id,
                ...whereOption
            },
            relations: {
                Sender: true
            }
        });
        const requestISent = requests.map(({ sended_at, Receiver }) => ({sended_at, ...Receiver}));
        const responseIReceived = responses.map(({ sended_at, Sender }) => ({sended_at, ...Sender})); 
        return {
            requestISent,
            responseIReceived
        }
    }

    async cancelRequest(me: Users, receiverId: number) {
        try {
            await this.mateReqRepository.createQueryBuilder()
                .softDelete()
                .from(MateRequestRecords)
                .where('Sender_id = :myId', { myId: me.id })
                .andWhere('Receiver_id = :receiverId', { receiverId })
                .execute();
        } catch(e) {
            throw new ForbiddenException();
        }
        return 'OK';
    }

    async removeMate(myId: number, mateId: number) {
        // push?
        // db row 삭제
        const mate = await this.validateMate(myId, mateId);
        if (!mate) {
            throw new ForbiddenException('Not Allowed');
        }
        try {
            await this.matesRepository.createQueryBuilder()
                .softDelete()
                .from(Mates)
                .where('id = :id', { id: mate.id })
                .execute();
        } catch(e) {
            throw new ForbiddenException('Invalid request');
        }
        await this.cacheManager.del(`${myId}_mates`);
        return "OK";
    }

    async getAlarmsofMate(myId: number, kakaoAccessToken: string) {
        // const cached = await this.cacheManager.get<Alarms[]>(`${myId}_mates_alarm_list`);
        // if (cached && cached.length != 0) {
        //     this.logger.log('Hit Cache');
        //     return cached;
        // }
        
        const mates = await this.getMateList(myId, kakaoAccessToken);
        let alarms = [];
        for await (let m of mates.mates) {
            const validMate = await this.validateMate(myId, m.id);
            if (!validMate) {
                throw new ForbiddenException('Not Allowed');
            }
            const alarm = await this.alarmsRepository.createQueryBuilder('alarms')
                        .innerJoinAndSelect('alarms.Host', 'h', 'h.id = :mateId', { mateId: m.id })
                        .innerJoin('alarms.Members', 'members')
                        .innerJoin('alarms.Game', 'game')
                        .select([
                            'alarms.id',
                            'alarms.name',
                            'alarms.time',
                            'alarms.is_repeated',
                            'alarms.is_private',
                            'alarms.music_name',
                            'alarms.max_member',
                            'alarms.created_at', 
                            'game.id', 
                            'game.name',
                            'game.thumbnail_url',
                            'members.id', 
                            'members.nickname',
                            'members.thumbnail_image_url'
                        ])
                        .where('alarms.expired_at > :now', { now: new Date() })
                        .getMany();
            alarms = [...alarms, ...alarm];
        }
        await this.cacheManager.set(`${myId}_mates_alarm_list`, alarms, { ttl: 60 * 60 * 24 });
        return alarms;  
    }

    async validateMate(myId: number, mateId: number) {
        return await this.matesRepository.findOne({
            where: [
                { Sender_id: myId, Receiver_id: mateId },
                { Sender_id: mateId, Receiver_id: myId }
            ]
        })
    }

    async getMateIds(myId: number) {
        const receivedMates = await this.matesRepository.createQueryBuilder('m')
                                    .innerJoinAndSelect('m.Receiver', 'r', 'r.id = :myId', { myId })
                                    .innerJoin('m.Sender', 's')
                                    .select([
                                        'm.id',
                                        's.id',
                                        's.nickname',
                                        's.thumbnail_image_url',
                                        's.kakao_id'
                                    ])
                                    .getMany();
        const sendedMates = await this.matesRepository.createQueryBuilder('m')
                                    .innerJoinAndSelect('m.Sender', 's', 's.id = :myId', { myId })
                                    .innerJoin('m.Receiver', 'r')
                                    .select([
                                        'm.id',
                                        's.id',
                                        'r.id',
                                        'r.nickname',
                                        'r.thumbnail_image_url',
                                        'r.kakao_id'
                                    ])
                                    .getMany();
        const usersOfMateIReceived = receivedMates.map(m => m.Sender.id);
        const usersOfMateISended = sendedMates.map(m => m.Receiver.id);
        const mateFinished = [ ...usersOfMateIReceived, ...usersOfMateISended];
        return mateFinished;
    }

    private async getMateById(id: number) {
        return await this.matesRepository.findOneOrFail({ where: { id }})
            .catch(_ => { throw new ForbiddenException() });
    }

    private async getUserByUserId(userId: number) {
        return await this.usersRepository.findOneOrFail({ where: { id: userId }})
                            .catch(_ => { throw new UnauthorizedException() });
    }

    private async saveMate(senderId: number, receiverId: number) {
        const newMate = new Mates();
        newMate.Sender_id = senderId, newMate.Receiver_id = receiverId;
        try {
            await this.matesRepository.save(newMate);
            await this.cacheManager.del(`${senderId}_mates`);
            await this.cacheManager.del(`${receiverId}_mates`);
            await this.cacheManager.del(`${senderId}_mates_alarm_list`);
            await this.cacheManager.del(`${receiverId}_mates_alarm_list`);
        } catch(e) {
            throw new ForbiddenException('Invalid request');
        }
    }

    private async updateMateRequest(senderId: number, receiverId: number, accept: boolean) {
        let toBeUpdated: QueryDeepPartialEntity<MateRequestRecords>;
        if (accept) {
            toBeUpdated = { is_accepted: true }
        } else {
            toBeUpdated = { is_rejected: true }
        }
        try {
            await this.mateReqRepository.createQueryBuilder('mr')
                            .update()
                            .set(toBeUpdated)
                            .where('Sender_id = :senderId', { senderId })
                            .andWhere('Receiver_id = :receiverId', { receiverId })
                            .execute();
        } catch (error) {
            throw new ForbiddenException('Invalid request');
        }
    }
}
