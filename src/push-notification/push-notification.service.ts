import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as admin from 'firebase-admin';
import {
  MessagingPayload,
  MulticastMessage,
  TopicMessage,
} from 'firebase-admin/lib/messaging/messaging-api';
import { Mates } from 'src/entities/mates.entity';
import { Notifications } from 'src/entities/notifications.entity';
import { DataSource, Repository } from 'typeorm';
import { SendPushDto } from './dto/send-push.dto';

@Injectable()
export class PushNotificationService {
  constructor(
    @InjectRepository(Notifications)
    private readonly notificationsRepository: Repository<Notifications>,
  ) {}
  connection = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });

  async sendPush(
    userId: number,
    deviceToken: string,
    title: string,
    body: string,
    data?,
  ) {
    try {
      const messageId = await this.connection.messaging().send({
        data: data ? data : {},
        notification: {
          title,
          body,
        },
        android: {
          priority: 'high',
        },
        apns: {
          headers: {
            'apns-priority': '10',
            'apns-push-type': 'alert',
          },
          payload: {
            aps: {
              contentAvailable: true,
            },
          },
        },
        token: deviceToken,
      });

      await this.saveNotification(userId, title, body);
      return messageId;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
  async sendPushToTopic(
    topic: string,
    title: string,
    body: string,
    data?: { [key: string]: string },
  ) {
    const message: TopicMessage = {
      data: data ? data : {},
      notification: {
        title,
        body,
      },
      android: {
        priority: 'high',
      },
      apns: {
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'alert',
        },
        payload: {
          aps: {
            contentAvailable: true,
          },
        },
      },
      topic,
    };
    try {
      const messageId = await this.connection.messaging().send(message);
      return messageId;
    } catch (e) {
      throw new UnauthorizedException('FCM error');
    }
  }

  async sendMulticast(
    tokens: string[],
    title: string,
    body: string,
    data?: { [key: string]: string },
  ) {
    const message: MulticastMessage = {
      data: data ? data : {},
      notification: {
        title,
        body,
      },
      android: {
        priority: 'high',
      },
      apns: {
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'alert',
        },
        payload: {
          aps: {
            contentAvailable: true,
          },
        },
      },
      tokens,
    };
    try {
      const messageId = await this.connection
        .messaging()
        .sendMulticast(message);
      return messageId;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  private async saveNotification(userId: number, title: string, body: string) {
    const newNoti = new Notifications();
    newNoti.User_id = userId;
    (newNoti.title = title), (newNoti.body = body);
    await this.notificationsRepository.manager.save(newNoti);
  }
}
