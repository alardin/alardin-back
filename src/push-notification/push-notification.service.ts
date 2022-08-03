import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as admin from 'firebase-admin';
import { Notifications } from 'src/entities/notifications.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PushNotificationService {

    constructor(
        @InjectRepository(Notifications)
        private readonly notificationsRepository: Repository<Notifications>,
    ) {
    }
    private connection = admin.initializeApp({
        credential: admin.credential.cert('firebase/service-account.json')
    });

    async sendPush(userId: number, deviceToken: string, title: string, body: string) {
        try {
            const messageId = await this.connection.messaging().send({
                    data: {
                        title,
                        body
                    },
                    notification: {
                        title,
                        body
                    },
                    token: deviceToken
            });
            await this.saveNotification({ userId, title, body });
            return messageId;
        } catch (e) {
            throw new UnauthorizedException();
        }
    }

    private async saveNotification({ userId, title, body }) {
        const newNoti = new Notifications()
        newNoti.User_id = userId;
        newNoti.title = title, newNoti.body = body;
        await this.notificationsRepository.manager.save(newNoti);
    }
}
