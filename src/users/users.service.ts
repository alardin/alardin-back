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
import { AccessAndRefreshToken } from 'src/auth/auth';
import { AuthService } from 'src/auth/auth.service';
import { AlarmPlayRecords } from 'src/entities/alarm.play.records.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { Users } from 'src/entities/users.entity';
import { KakaoService } from 'src/external/kakao/kakao.service';
import { DataSource, In, MoreThan, Not, Repository } from 'typeorm';
import { AuthDto } from './dto/auth.dto';
import { EditProfileDto } from './dto/edit-profile.dto';
import { OthersProfileDto } from './dto/others.profile.dto';
import * as bcrypt from 'bcryptjs';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AlarmResults } from 'src/entities/alarm.results.entity';
import { Mates } from 'src/entities/mates.entity';
import { Cache } from 'cache-manager';
import { MateService } from 'src/mate/mate.service';
import * as AWS from 'aws-sdk';
import * as md5 from 'crypto-js/md5';
import * as path from 'path';
import { AwsService } from 'src/aws/aws.service';

type MatePlayHistory = {
  id: number;
  nickname: string;
  thumbnail_image_url: string;
  playCount: number;
  successCount: number;
  failCount: number;
  mateDue: number;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly kakaoService: KakaoService,
    private readonly authService: AuthService,
    private readonly mateService: MateService,
    private readonly awsService: AwsService,
    private dataSource: DataSource,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Alarms)
    private readonly alarmsRepository: Repository<Alarms>,
    @InjectRepository(AlarmPlayRecords)
    private readonly alarmPlayRecordsRepository: Repository<AlarmPlayRecords>,
    @InjectRepository(AlarmResults)
    private readonly alarmResultsRepository: Repository<AlarmResults>,
    @InjectRepository(Mates)
    private readonly matesRepository: Repository<Mates>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {}
  private readonly adminCandidate = process.env.ADMIN_EMAILS.split(' ');
  async auth(tokens: AuthDto): Promise<AccessAndRefreshToken> {
    return await this.authService.kakaoAuth(tokens);
  }

  async destroyToken(userId: number) {
    await this.updateUser(userId, {
      refresh_token: null,
      device_token: null,
      kakao_access_token: null,
      kakao_refresh_token: null,
    });
  }

  async deleteMates(me: Users) {
    try {
      const mateIds = await this.mateService.getMateIds(me.id);
      mateIds.map(async (mId) => await this.mateService.removeMate(me.id, mId));
    } catch (e) {
      throw new ForbiddenException('Error: Deleting Mates');
    }
    return 'OK';
    //removeMate
  }

  async deleteUser(userId: number) {
    await this.usersRepository
      .createQueryBuilder()
      .softDelete()
      .from(Users)
      .where('id = :id', { id: userId })
      .execute();
    return 'OK';
  }

  /**
   * validate refresh token
   * generate new access & refresh token
   * https://velog.io/@jkijki12/Jwt-Refresh-Token-%EC%A0%81%EC%9A%A9%EA%B8%B0
   */

  async refreshAppToken(userId: number) {
    const { id, email } = await this.getUser(userId);
    const tokens = this.authService.login({ id, email });
    await this.updateUsersRefreshToken(id, tokens.appRefreshToken);
    return tokens;
  }
  async refreshKakaoToken(userId: number) {
    const { kakao_refresh_token } = await this.getUser(userId);
    const { accessToken, refreshToken } =
      await this.kakaoService.refreshKakaoTokens(kakao_refresh_token);
    await this.updateUser(
      userId,
      {
        kakao_access_token: accessToken,
        kakao_refresh_token: refreshToken,
      },
      ['kakao_access_token', 'kakao_refresh_token'],
    );
  }

  async getUserProfile(
    myId: number,
    targetId: number,
  ): Promise<Users | OthersProfileDto> {
    const user = await this.usersRepository
      .findOneOrFail({ where: { id: targetId } })
      .catch(() => {
        throw new InternalServerErrorException();
      });
    if (user.id === myId) {
      return user;
    }
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      name: user.name,
      thumbnail_image_url: user.thumbnail_image_url,
      bio: user.bio,
      gender: user.gender,
    };
  }

  async editUserProfile(
    myId: number,
    {
      nickname,
      profile_image_url,
      thumbnail_image_url,
      bio,
      is_private,
    }: EditProfileDto,
  ) {
    await this.updateUser(myId, {
      nickname,
      profile_image_url,
      thumbnail_image_url,
      bio,
      is_private,
    });
    return 'OK';
  }

  async getUserAlarmRecords(
    myId: number,
    skip: number,
    take: number,
  ): Promise<AlarmPlayRecords[]> {
    if (!skip || !take) {
      skip = 0;
      take = 100;
    }
    return await this.alarmPlayRecordsRepository
      .createQueryBuilder('apr')
      .innerJoinAndSelect('apr.User', 'u', 'u.id = :myId', { myId })
      .skip(skip)
      .take(take)
      .getMany();
  }

  async getUsersHostedAlarm(myId: number): Promise<Alarms[]> {
    const cached = await this.cacheManager.get<Alarms[]>(
      `${myId}_hosted_alarms`,
    );
    if (cached && cached.length != 0) {
      this.logger.log('Hit Cache');
      return cached;
    }

    let hostedAlarms = await this.alarmsRepository.find({
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
          thumbnail_url: true,
        },
        Host: {
          id: true,
          nickname: true,
          thumbnail_image_url: true,
        },
        Members: {
          id: true,
          nickname: true,
          thumbnail_image_url: true,
        },
      },
      where: {
        Host_id: myId,
        expired_at: MoreThan(new Date()),
      },
      relations: {
        Game: true,
        Members: true,
        Host: true,
      },
    });
    hostedAlarms = hostedAlarms.map(({ Host, ...withOutHost }) => {
      withOutHost.Members = withOutHost.Members.filter((m) => m.id != Host.id);
      withOutHost.Members = [Host, ...withOutHost.Members];
      return { ...withOutHost, Host };
    });
    await this.cacheManager.set(`${myId}_hosted_alarms`, hostedAlarms, {
      ttl: 60 * 60 * 24,
    });
    return hostedAlarms;
  }

  async getUsersJoinedAlarm(myId: number): Promise<Alarms[]> {
    const cached = await this.cacheManager.get<Alarms[]>(
      `${myId}_joined_alarms`,
    );
    if (cached && cached.length != 0) {
      this.logger.log('Hit Cache');
      return cached;
    }
    const joinedAlarms = await this.alarmsRepository
      .createQueryBuilder('alarms')
      .innerJoin('alarms.Members', 'members', 'members.id = :myId', { myId })
      .select(['alarms.id'])
      .getMany();
    const joinedAlarmsIds = joinedAlarms.map((m) => m.id);
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
          thumbnail_url: true,
        },
        Host: {
          id: true,
          nickname: true,
          thumbnail_image_url: true,
        },
        Members: {
          id: true,
          nickname: true,
          thumbnail_image_url: true,
        },
      },
      where: {
        id: In(joinedAlarmsIds),
        expired_at: MoreThan(new Date()),
      },
      relations: {
        Game: true,
        Members: true,
        Host: true,
      },
    });
    returnJoinedAlarms = returnJoinedAlarms.map(({ Host, ...withOutHost }) => {
      withOutHost.Members = withOutHost.Members.filter((m) => m.id != Host.id);
      withOutHost.Members = [Host, ...withOutHost.Members];
      return { ...withOutHost, Host };
    });
    await this.cacheManager.set(`${myId}_joined_alarms`, returnJoinedAlarms, {
      ttl: 60 * 60 * 24,
    });
    return returnJoinedAlarms;
  }

  async getUserHistoryByAlarm(myId: number) {
    // const cached = await this.cacheManager.get<AlarmPlayRecords[]>(`${myId}_records_by_alarm`);
    // if (cached && cached.length != 0) {
    //     this.logger.log('Hit Cache');
    //     return cached;
    // }
    const recordsByAlarm = await this.alarmPlayRecordsRepository.find({
      where: {
        User_id: myId,
        Alarm_result: {
          Alarm: {
            Members: {
              id: Not(myId),
            },
          },
        },
      },
      select: {
        created_at: true,
        Alarm_result: {
          start_time: true,
          end_time: true,
          Game: {
            name: true,
            thumbnail_url: true,
          },
          data: {
            play_time: true,
          },
          Alarm: {
            id: true,
            Members: {
              nickname: true,
              thumbnail_image_url: true,
            },
          },
        },
      },
      relations: {
        Alarm_result: {
          Game: true,
          Alarm: {
            Members: true,
          },
        },
      },
      order: {
        created_at: 'DESC',
      },
    });

    // if (recordsByAlarm.length != 0) {
    //     await this.cacheManager.set(`${myId}_records_by_alarm`, recordsByAlarm, { ttl: 60 * 60 * 24 });
    // }
    return recordsByAlarm;
  }

  async getUserHistoryByCount(myId: number) {
    // const cached = await this.cacheManager.get<MatePlayHistory[]>(`${myId}_records_by_count`);
    // if (cached && cached.length != 0) {
    //     this.logger.log('Hit Cache');
    //     return cached;
    // }
    const SendedMates = await this.matesRepository
      .createQueryBuilder('m')
      .select([
        'Receiver_id as id',
        'r.nickname as nickname',
        'r.thumbnail_image_url as thumbnail_image_url',
        'm.updated_at as updated_at',
      ])
      .innerJoin('m.Receiver', 'r')
      .where('Sender_id = :myId', { myId })
      .andWhere('Receiver_id != :myId', { myId })
      .getRawMany();
    const ReceivedMates = await this.matesRepository
      .createQueryBuilder('m')
      .select([
        'Sender_id as id',
        's.nickname as nickname',
        's.thumbnail_image_url as thumbnail_image_url',
        'm.updated_at as updated_at',
      ])
      .innerJoin('m.Sender', 's')
      .where('Receiver_id = :myId', { myId })
      .andWhere('Sender_id != :myId', { myId })
      .getRawMany();

    const mates = [...SendedMates, ...ReceivedMates];
    const playRecordsWithMates: MatePlayHistory[] = [];
    for await (const mate of mates) {
      let playCount = 0,
        successCount = 0,
        failCount = 0,
        mateDue = 0;
      mateDue = Math.ceil(
        (new Date().getTime() - mate.updated_at.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const membersOfAlarmPlayedByMate =
        await this.alarmPlayRecordsRepository.query(
          `SELECT alarm_members.Alarm_id, GROUP_CONCAT(alarm_members.User_id) as User_ids 
                    FROM alarm_play_records INNER JOIN alarm_results on Alarm_result_id = alarm_results.id INNER JOIN alarm_members ON alarm_results.Alarm_id = alarm_members.Alarm_id 
                    WHERE alarm_play_records.User_id = ${mate.id} group by alarm_members.Alarm_id`,
        );

      for await (const am of membersOfAlarmPlayedByMate) {
        am.User_ids = am.User_ids.split(',').map((uid: string) => Number(uid));
        if (am.User_ids.includes(mate.id) & am.User_ids.includes(myId)) {
          playCount += 1;
        }
        // select * from alarm_results where Alarm_id = 42;
        const alamrResult = await this.alarmResultsRepository.findOneOrFail({
          select: {
            is_cleared: true,
          },
          where: { Alarm_id: am.Alarm_id },
        });
        if (alamrResult.is_cleared) {
          successCount += 1;
        } else {
          failCount += 1;
        }
      }
      playRecordsWithMates.push({
        id: mate.id,
        nickname: mate.nickname,
        thumbnail_image_url: mate.thumbnail_image_url,
        playCount,
        successCount,
        failCount,
        mateDue,
      });
    }
    // if (playRecordsWithMates.length != 0) {
    //     await this.cacheManager.set(`${myId}_records_by_count`, playRecordsWithMates, { ttl: 60 * 60 * 24 });
    // }
    return playRecordsWithMates;
  }

  private async getUser(userId: number) {
    return await this.usersRepository.findOne({ where: { id: userId } });
  }

  async updateUser(
    userId: number,
    condition: QueryDeepPartialEntity<Users>,
    keyNeededCheck?: string[],
  ): Promise<string> {
    const user = await this.getUser(userId);
    if (keyNeededCheck) {
      keyNeededCheck.forEach((key) => {
        if (user[key] === undefined) {
          throw new InternalServerErrorException('Invalid request');
        }
      });
    }

    try {
      await this.usersRepository
        .createQueryBuilder()
        .update(Users)
        .set(condition)
        .where('id = :userId', { userId: user.id })
        .execute();
      return 'OK';
    } catch (e) {
      throw new ForbiddenException('Invalid request');
    }
  }

  async updateProfileImage(userId: number, file: Express.Multer.File) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
      region: 'ap-northeast-2',
    });
    const bucket = process.env.AWS_S3_STATIC_BUCKET;
    const user = await this.getUser(userId);
    const ext = path.extname(file.originalname);
    const profileImageKey = `profiles/${Date.now()}-${md5(
      String(user.id) + process.env.SALT,
    ).toString()}${ext}`;
    try {
      const profileUrl = await this.awsService.uploadToS3(
        bucket,
        profileImageKey,
        file,
      );
      await this.updateUser(
        userId,
        {
          profile_image_url: `${process.env.AWS_S3_STATIC_BUCKET_URL}/${profileImageKey}`,
          thumbnail_image_url: `${process.env.AWS_S3_STATIC_BUCKET_URL}/${profileImageKey}`,
        },
        ['profile_image_url', 'thumbnail_image_url'],
      );
      return profileUrl;
    } catch (e) {
      throw new InternalServerErrorException('Error: profileImage');
    }
  }

  private async updateUsersRefreshToken(userId: number, refreshToken: string) {
    // this.redisService.setValue('appRT', userId, refreshToken);
    const hashedRT = await bcrypt.hash(refreshToken, 12);
    return await this.updateUser(userId, { refresh_token: hashedRT }, [
      'refresh_token',
    ]);
  }
}
