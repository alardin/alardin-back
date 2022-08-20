import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Alarms } from 'src/entities/alarms.entity';
import { MateRequestRecords } from 'src/entities/mate-request.records.entity';
import { Mates } from 'src/entities/mates.entity';
import { Users } from 'src/entities/users.entity';
import { KakaoService } from 'src/external/kakao/kakao.service';
import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { Repository } from 'typeorm';

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
        @InjectRepository(Alarms)
        private readonly alarmsRepository: Repository<Alarms>,
    ) {}

    async getMateList(myId: number) {

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
                                        'r.id',
                                        'r.nickname',
                                        'r.thumbnail_image_url',
                                        'r.kakao_id'
                                    ])
                                    .getMany();
        const userOfMateIreceived = receivedMates.map(m => m.Sender);
        const userOfMateIsended = sendedMates.map(m => m.Receiver);
        // const friends = await this.kakaoService.getKakaoFriends(kakaoAccessToken);
    
        return [ ...userOfMateIreceived, ...userOfMateIsended];
    }

    async sendMateRequest(me: Users, receiverKakaoId: number, data) {
        if (receiverKakaoId) {
            return null;
        }
        const receiver = await this.usersRepository.findOneOrFail({ where: { kakao_id: receiverKakaoId }})
                                .catch(_ => { throw new NotFoundException() });
        const title = 'Mate request';
        const body = `${me.nickname} Send mate request to ${receiver.nickname}`;
        const messagId = await this.pushNotiService.sendPush(receiver.id, receiver.device_token, title, body, data);

        await this.saveMateRequest(me.id, receiver.id, 'REQUEST');
        return messagId;
    }

    async responseToMateRequest(me: Users, senderId: number, response: string) {
        // if ok -> mate db save, 요청자에게 push
        const mateReq = await this.mateReqRepository.findOneOrFail({ where: { Sender_id: senderId }})
            .catch(_ => { throw new ForbiddenException() });

        const sender = await this.getUserByUserId(mateReq.Sender_id);

        if (response === 'ACCEPT') {
            const title = 'Mate repsonse';
            const body = `${me.nickname} accept the request`;
            await this.pushNotiService.sendPush(sender.id, sender.device_token, title, body);
            await this.saveMateRequest(me.id, sender.id, 'RESPONSE');
            await this.saveMate(sender.id, me.id);
        }

        return 'OK';
 
    }

    async removeMate(myId: number, mateId: number) {
        // push?
        // db row 삭제
        const mate = await this.validateMate(myId, mateId);
        try {
            await this.matesRepository.createQueryBuilder()
                .softDelete()
                .from(Mates)
                .where('id = :id', { id: mate.id })
                .andWhere('Sender_id = :id', { myId })
                .execute();
        } catch(e) {
            throw new ForbiddenException('Invalid request');
        }
    }

    async getAlarmsofMate(myId: number) {
        const mates = await this.getMateList(myId);
        let alarms = [];
        for await (let m of mates) {
            await this.validateMate(myId, m.id);
            const alarm = await this.alarmsRepository.createQueryBuilder('alarms')
                        .innerJoinAndSelect('alarms.Host', 'h', 'h.id = :mateId', { mateId: m.id })
                        .innerJoin('alarms.Members', 'members')
                        .innerJoin('alarms.Game', 'game')
                        .select([
                            'alarms.id',
                            'alarms.time',
                            'alarms.is_repeated',
                            'alarms.is_private',
                            'alarms.music_volume',
                            'alarms.max_members',
                            'alarms.created_at', 
                            'game.id', 
                            'game.name',
                            'game.thumbnail_url',
                            'members.id', 
                            'members.nickname',
                            'members.thumbnail_image_url'
                        ])
                        .getMany();
            alarms = [...alarms, ...alarm]
        }
        return alarms;  
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
        } catch(e) {
            throw new ForbiddenException('Invalid request');
        }
    }

    private async saveMateRequest(senderId: number, receiverId: number, type: string) {
        const newMateReq = new MateRequestRecords()
        newMateReq.Sender_id = senderId;
        newMateReq.Receiver_id = receiverId;
        newMateReq.type = type

        try {
            await this.mateReqRepository.save(newMateReq);
        } catch (error) {
            throw new ForbiddenException('Invalid request');
        }
    }

    async validateMate(myId: number, mateId: number) {
        return await this.matesRepository.findOneOrFail({
            where: [
                { Sender_id: myId, Receiver_id: mateId },
                { Sender_id: mateId, Receiver_id: myId }
            ]
        }).catch(_ => { throw new ForbiddenException() });
    }
}
