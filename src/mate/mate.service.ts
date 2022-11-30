import {
  CACHE_MANAGER,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { NotAllowedRequestException } from 'src/common/exceptions/exceptions';
import { Alarms } from 'src/entities/alarms.entity';
import { MateRequestRecords } from 'src/entities/mate-request.records.entity';
import { Mates } from 'src/entities/mates.entity';
import { Users } from 'src/entities/users.entity';
import { KakaoService } from 'src/external/kakao/kakao.service';
import { KakaoFriend } from 'src/external/kakao/kakao.types';
import { PushNotificationService } from 'src/push-notification/push-notification.service';
import {
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { MateRepository } from '../common/repository/mate.repository';

type TMateListKakao = {
  mates: Users[];
  kakaoFriends: KakaoFriend[];
};

type TMateList = {
  mates: Users[];
};

@Injectable()
export class MateService {
  constructor(
    private readonly pushNotiService: PushNotificationService,
    private readonly kakaoService: KakaoService,
    private readonly mateRepository: MateRepository,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(MateRequestRecords)
    private readonly mateReqRepository: Repository<MateRequestRecords>,
    @InjectRepository(Alarms)
    private readonly alarmsRepository: Repository<Alarms>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {}

  async getMateList(myId: number): Promise<TMateList> {
    const mates = await this.getMates(myId);

    return {
      mates,
    };
  }

  async getMateListWithKakao(
    myId: number,
    kakaoAccessToken: string,
  ): Promise<TMateListKakao> {
    const friends = await this.kakaoService.getKakaoFriends(kakaoAccessToken);
    const mates = await this.getMates(myId);
    await this.cacheManager.set(
      `${myId}_mates`,
      {
        mates,
        kakaoFriends: friends,
      },
      { ttl: 60 * 60 * 24 },
    );
    return {
      mates: mates,
      kakaoFriends: friends,
    };
  }

  async sendMateRequest(me: Users, receiverId: number) {
    const mateReqNotProcessed = await this.mateReqRepository.findOne({
      where: {
        Sender_id: me.id,
        Receiver_id: receiverId,
        is_accepted: 0,
        is_rejected: 0,
      },
    });
    if (mateReqNotProcessed) {
      return null;
    }

    const receiver = await this.usersRepository
      .findOneOrFail({ where: { id: receiverId } })
      .catch(_ => {
        throw new ForbiddenException('Invalid id');
      });
    await this.mateReqRepository.query(
      `INSERT INTO mate_request_records(Sender_id, Receiver_id, is_accepted, is_rejected) VALUES(${me.id}, ${receiver.id}, 0, 0)`,
    );
    await this.pushNotiService.sendPush(
      receiver.id,
      receiver.device_token,
      `${me.nickname}님의 메이트를 요청`,
      `${me.nickname}님께서 회원님과의 메이트를 요청하셨습니다.`,
      {
        type: 'MATE_ALARM',
        message: JSON.stringify({
          type: 'mate',
          content: `${me.nickname}님께서 회원님과의 메이트를 요청하셨습니다.`,
          date: new Date(Date.now()).toISOString(),
          id: me.id, // number
          nickname: me.nickname, // string
          thumbnail_image_url: me.thumbnail_image_url,
        }),
      },
    );
    return 'OK';
  }

  async sendMateRequestFromKakao(me: Users, receiverKakaoId: number) {
    const mateReqNotProcessed = await this.mateReqRepository.findOne({
      where: {
        Sender_id: me.id,
        Receiver: { kakao_id: receiverKakaoId },
        is_accepted: 0,
        is_rejected: 0,
      },
    });
    if (mateReqNotProcessed) {
      return null;
    }

    if (!receiverKakaoId) {
      return null;
    }
    const receiver = await this.usersRepository
      .findOneOrFail({ where: { kakao_id: receiverKakaoId } })
      .catch(_ => {
        throw new ForbiddenException('Invalid id');
      });
    await this.mateReqRepository.query(
      `INSERT INTO mate_request_records(Sender_id, Receiver_id, is_accepted, is_rejected) VALUES(${me.id}, ${receiver.id}, 0, 0)`,
    );
    await this.pushNotiService.sendPush(
      receiver.id,
      receiver.device_token,
      `${me.nickname}님의 메이트를 요청`,
      `${me.nickname}님께서 회원님과의 메이트를 요청하셨습니다.`,
      {
        type: 'MATE_ALARM',
        message: JSON.stringify({
          type: 'mate',
          content: `${me.nickname}님께서 회원님과의 메이트를 요청하셨습니다.`,
          date: new Date(Date.now()).toISOString(),
          id: me.id, // number
          nickname: me.nickname, // string
          thumbnail_image_url: me.thumbnail_image_url,
        }),
      },
    );
    return 'OK';
  }

  async responseToMateRequest(me: Users, senderId: number, response: string) {
    // if ok -> mate db save, 요청자에게 push
    if (!senderId) {
      return null;
    }
    const mateReq = await this.mateReqRepository
      .findOneOrFail({ where: { Sender_id: senderId, Receiver_id: me.id } })
      .catch(_ => {
        throw new ForbiddenException();
      });

    const sender = await this.usersRepository
      .findOneOrFail({ where: { id: mateReq.Sender_id } })
      .catch(e => {
        throw new ForbiddenException('invalid request');
      });

    switch (response) {
      case 'ACCEPT':
        await this.updateMateRequest(sender.id, me.id, true);
        await this.saveMate(sender.id, me.id);
        await this.pushNotiService.sendPush(
          sender.id,
          sender.device_token,
          `${me.nickname}님과 메이트 수락`,
          `${me.nickname}님께서 회원님과의 메이트를 수락했습니다.`,
          {
            type: 'MATE_ALARM',
            message: JSON.stringify({
              type: 'mate',
              content: `${me.nickname}님께서 회원님과의 메이트를 수락했습니다.`,
              date: new Date(Date.now()).toISOString(),
              id: me.id, // number
              nickname: me.nickname, // string
              thumbnail_image_url: me.thumbnail_image_url,
            }),
          },
        );
        break;
      case 'REJECT':
        await this.updateMateRequest(sender.id, me.id, false);
        break;
      default:
        break;
    }

    return 'OK';
  }

  async searchMates(keyword: string) {
    let searchedUsers: Users[] = [];
    if (keyword.length > 0) {
      searchedUsers = await this.usersRepository.find({
        where: {
          is_private: false,
          nickname: ILike(`%${keyword}%`),
        },
        select: {
          id: true,
          nickname: true,
          thumbnail_image_url: true,
        },
      });
    }
    return searchedUsers;
  }

  async getMateRequestList(me: Users) {
    let whereOption: FindOptionsWhere<MateRequestRecords> = {
      is_accepted: 0,
      is_rejected: 0,
    };
    let userOption: FindOptionsSelect<Users> = {
      id: true,
      nickname: true,
      thumbnail_image_url: true,
    };
    const requests = await this.mateReqRepository.find({
      select: {
        Receiver: userOption,
        sended_at: true,
      },
      where: {
        Sender_id: me.id,
        ...whereOption,
      },
      relations: {
        Receiver: true,
      },
    });
    const responses = await this.mateReqRepository.find({
      select: {
        Sender: userOption,
        sended_at: true,
      },
      where: {
        Receiver_id: me.id,
        ...whereOption,
      },
      relations: {
        Sender: true,
      },
    });
    const requestISent = requests.map(({ sended_at, Receiver }) => ({
      sended_at,
      ...Receiver,
    }));
    const responseIReceived = responses.map(({ sended_at, Sender }) => ({
      sended_at,
      ...Sender,
    }));
    return {
      requestISent,
      responseIReceived,
    };
  }

  async cancelRequest(me: Users, receiverId: number) {
    try {
      await this.mateReqRepository
        .createQueryBuilder()
        .softDelete()
        .from(MateRequestRecords)
        .where('Sender_id = :myId', { myId: me.id })
        .andWhere('Receiver_id = :receiverId', { receiverId })
        .execute();
    } catch (e) {
      throw new ForbiddenException();
    }
    return 'OK';
  }

  async removeMate(myId: number, mateId: number) {
    // push?
    // db row 삭제
    const mate = await this.mateRepository.findOneMate({ myId, mateId });
    if (!mate) {
      throw new NotAllowedRequestException();
    }
    await this.mateRepository.softDeleteOne({ id: mate.id }).catch(_ => {
      throw new InternalServerErrorException();
    });
    return 'OK';
  }

  async getAlarmsofMate(myId: number, kakaoAccessToken?: string) {
    const mates = kakaoAccessToken
      ? await this.getMateListWithKakao(myId, kakaoAccessToken)
      : await this.getMateList(myId);
    let alarms = [];
    for await (let m of mates.mates) {
      const validMate = await this.validateMate(myId, m.id);
      if (!validMate) {
        throw new NotAllowedRequestException();
      }
      const alarm = await this.alarmsRepository
        .createQueryBuilder('alarms')
        .innerJoinAndSelect('alarms.Host', 'h', 'h.id = :mateId', {
          mateId: m.id,
        })
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
          'members.thumbnail_image_url',
        ])
        .where('alarms.expired_at > :now', { now: new Date() })
        .getMany();
      alarms = [...alarms, ...alarm];
    }
    return alarms;
  }

  async validateMate(myId: number, mateId: number) {
    return await this.mateRepository.findOne({
      where: [
        { Sender_id: myId, Receiver_id: mateId },
        { Sender_id: mateId, Receiver_id: myId },
      ],
    });
  }

  async getMateIds(myId: number) {
    const receivedMates = await this.mateRepository
      .createQueryBuilder('m')
      .innerJoinAndSelect('m.Receiver', 'r', 'r.id = :myId', { myId })
      .innerJoin('m.Sender', 's')
      .select([
        'm.id',
        's.id',
        's.nickname',
        's.thumbnail_image_url',
        's.kakao_id',
      ])
      .getMany();
    const sendedMates = await this.mateRepository
      .createQueryBuilder('m')
      .innerJoinAndSelect('m.Sender', 's', 's.id = :myId', { myId })
      .innerJoin('m.Receiver', 'r')
      .select([
        'm.id',
        's.id',
        'r.id',
        'r.nickname',
        'r.thumbnail_image_url',
        'r.kakao_id',
      ])
      .getMany();
    const usersOfMateIReceived = receivedMates.map(m => m.Sender.id);
    const usersOfMateISended = sendedMates.map(m => m.Receiver.id);
    const mateFinished = [...usersOfMateIReceived, ...usersOfMateISended];
    return mateFinished;
  }

  private async getMates(myId: number) {
    const receivedMates = await this.mateRepository
      .createQueryBuilder('m')
      .innerJoinAndSelect('m.Receiver', 'r', 'r.id = :myId', { myId })
      .innerJoin('m.Sender', 's')
      .select([
        'm.id',
        's.id',
        's.nickname',
        's.thumbnail_image_url',
        's.kakao_id',
      ])
      .getMany();
    const sendedMates = await this.mateRepository
      .createQueryBuilder('m')
      .innerJoinAndSelect('m.Sender', 's', 's.id = :myId', { myId })
      .innerJoin('m.Receiver', 'r')
      .select([
        'm.id',
        's.id',
        'r.id',
        'r.nickname',
        'r.thumbnail_image_url',
        'r.kakao_id',
      ])
      .getMany();
    const usersOfMateIReceived = receivedMates.map(m => m.Sender);
    const usersOfMateISended = sendedMates.map(m => m.Receiver);
    const mateFinished = [...usersOfMateIReceived, ...usersOfMateISended];
    return mateFinished;
  }

  private async saveMate(senderId: number, receiverId: number) {
    const mate = await this.mateRepository.findOne({
      where: [
        {
          Sender_id: senderId,
          Receiver_id: receiverId,
        },
        {
          Sender_id: receiverId,
          Receiver_id: senderId,
        },
      ],
    });

    if (mate) {
      return null;
    }

    const newMate = new Mates();
    (newMate.Sender_id = senderId), (newMate.Receiver_id = receiverId);
    try {
      await this.mateRepository.save(newMate);
    } catch (e) {
      throw new ForbiddenException('Invalid request');
    }
    return 'OK';
  }

  private async updateMateRequest(
    senderId: number,
    receiverId: number,
    accept: boolean,
  ) {
    let toBeUpdated: QueryDeepPartialEntity<MateRequestRecords>;
    if (accept) {
      toBeUpdated = { is_accepted: 1 };
    } else {
      toBeUpdated = { is_rejected: 1 };
    }
    try {
      await this.mateReqRepository
        .createQueryBuilder('mr')
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
