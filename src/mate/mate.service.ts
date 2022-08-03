import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Alarms } from 'src/entities/alarms.entity';
import { MateRequestRecords } from 'src/entities/mate-request.records.entity';
import { Mates } from 'src/entities/mates.entity';
import { Users } from 'src/entities/users.entity';
import { KakaoService } from 'src/external/kakao/kakao.service';
import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { DataSource, FindOptionsUtils, Repository } from 'typeorm';

@Injectable()
export class MateService {
    constructor(
        private readonly pushNotiService: PushNotificationService,
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

        return await this.matesRepository.find({
            where: [
                { Sender_id: myId },
                { Receiver_id: myId }
            ],
            relations: {
                Sender: true,
                Receiver: true
            }
        });
    }

    async sendMateRequest(me: Users, receiverId: number) {

        const receiver = await this.usersRepository.findOneOrFail({ where: { id: receiverId }})
                                .catch(_ => { throw new NotFoundException() });
        const title = 'Mate request';
        const body = `${me.nickname} Send mate request to ${receiver.nickname}`;
        const messagId = await this.pushNotiService.sendPush(receiver.id, receiver.device_token, title, body);

        await this.saveMateRequest(me.id, receiver.id, 'REQUEST');
        return messagId;
    }

    async responseToMateRequest(me: Users, senderId: number, response: string) {
        // if ok -> mate db save, 요청자에게 push
        await this.mateReqRepository.findOneOrFail({ where: { Sender_id: senderId }})
            .catch(_ => { throw new ForbiddenException() });

        const sender = await this.getUserByUserId(senderId);

        if (response === 'ACCEPT') {
            const title = 'Mate repsonse';
            const body = `${me.nickname} accept the request`;
            await this.pushNotiService.sendPush(sender.id, sender.device_token, title, body);
            await this.saveMateRequest(me.id, sender.id, 'RESPONSE');
            await this.saveMate(sender.id, me.id);
        }

        return 'OK';
 
    }

    async removeMate(myId: number, id: number) {
        // push?
        // db row 삭제
        const mate = await this.getMateById(id);
        if (mate.Sender_id == myId) {
            await this.validateMate(myId, mate.Receiver_id);
        } else if (mate.Receiver_id == myId) {
            await this.validateMate(myId, mate.Sender_id);
        }
        try {
            await this.matesRepository.createQueryBuilder()
                .softDelete()
                .from(Mates)
                .where('id = :id', { id })
                .andWhere('Sender_id = :id', { myId })
                .execute();
        } catch(e) {
            throw new InternalServerErrorException();
        }
    }

    async getMateHostAlarms(myId: number, mateId: number) {
        await this.validateMate(myId, mateId);
        return await this.alarmsRepository.createQueryBuilder('alarms')
            .innerJoinAndSelect('alarms.Host', 'h', 'h.id = :mateId', { mateId })
            .getMany();
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
            throw new InternalServerErrorException();
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
            throw new InternalServerErrorException();
        }
    }

    private async validateMate(myId: number, mateId: number) {
        return await this.matesRepository.findOneOrFail({
            where: [
                { Sender_id: myId, Receiver_id: mateId },
                { Sender_id: mateId, Receiver_id: myId }
            ]
        }).catch(_ => { throw new ForbiddenException() });
    }
}
