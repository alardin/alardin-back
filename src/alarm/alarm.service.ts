import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { GamePlayImages } from 'src/entities/game-play.images.entity';
import { GamePlayKeywords } from 'src/entities/game-play.keywords.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { Games } from 'src/entities/games.entity';
import { MateService } from 'src/mate/mate.service';
import { DataSource, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CreateAlarmDto } from './dto/create-alarm.dto';

@Injectable()
export class AlarmService {
    constructor(
        private readonly mateService: MateService,
        @InjectRepository(Alarms)
        private readonly alarmsRepository: Repository<Alarms>,
        @InjectRepository(AlarmMembers)
        private readonly alarmMembersRepository: Repository<AlarmMembers>,
        @InjectRepository(GamePurchaseRecords)
        private readonly gamePurRepository: Repository<GamePurchaseRecords>,
        private dataSource: DataSource
    ) {}

    async createNewALarm(myId: number, body: CreateAlarmDto) {
        let newAlarm: Alarms;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const is_owned = Boolean(await this.gamePurRepository.createQueryBuilder('gpr')
                                .innerJoin('gpr.Game', 'g', 'g.id = :gameId', { gameId: body.Game_id })
                                .innerJoin('gpr.User', 'u', 'u.id = :myId', { myId })
                                .getOne());
            if(!is_owned) {
                throw new ForbiddenException();
            }
            
            newAlarm = await queryRunner.manager.getRepository(Alarms).save({
                Host_id: myId,
                member_count: 1,
                ...body
            });

            await queryRunner.manager.getRepository(AlarmMembers).save({
                Alarm_id: newAlarm.id,
                User_id: myId
            });
            
            const keywordCount = (await queryRunner.manager.getRepository(Games)
                                .findOne({ where: { id: body.Game_id }}))
                                .keyword_count;

            const randomKeywordId = await queryRunner.manager.getRepository(GamePlayKeywords).createQueryBuilder('gpk')
                            .select('gpk.id')
                            .innerJoin('gpk.Game', 'g', 'g.id = :gameId', { gameId: body.Game_id })
                            .skip(Math.floor(Math.random() * keywordCount))
                            .limit(1)
                            .execute();
            const imageCount = (await queryRunner.manager.getRepository(GamePlayKeywords)
                            .findOne({ where: { id: randomKeywordId }})).image_count;
            const selectedGPIs = await queryRunner.manager.getRepository(GamePlayImages).createQueryBuilder('gpi')
                    .select('gpi.*')
                    .innerJoin('gpi.Keyword', 'k', 'k.id = :kId', { kId: randomKeywordId })
                    .skip(Math.floor(Math.random() * (imageCount - 6)))
                    .limit(6)
                    .getMany();
            
            // push alarm
            // random image select?
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new ForbiddenException('Invalid request');

        } finally {
            await queryRunner.release();
        }
        if (!newAlarm) {
            return null;
        }
        return newAlarm.id;
    }

    async editAlarm(myId: number, alarmId: number, condition: QueryDeepPartialEntity<Alarms>) {
        const alarm = await this.getAlarmById(alarmId);
        if (myId !== alarm.Host_id) {
            throw new ForbiddenException();
        }
        await this.alarmsRepository.createQueryBuilder()
            .update(Alarms)
            .set(condition)
            .where('id = :id', { id: alarm.id })
            .execute();
            
        return 'OK';
    }

    // private 이면
        // host가 나랑 mate인지 확인
    // 내가 들어갈 수 있는 인원인지 확인
    // 알람 멤버에 나 추가
    // 알람 멤버 수 업데이트
    async joinAlarm(myId:number, alarmId: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const alarm = await this.getAlarmById(alarmId);
            if (alarm.is_private) {
                const validMate = await this.mateService.validateMate(myId, alarm.Host_id);
                if (!validMate) {
                    throw new ForbiddenException();
                }
            }
            if (alarm.member_count >= alarm.max_members) {
                throw new ForbiddenException();
            }
            const alarmMembers = new AlarmMembers();
            alarmMembers.User_id = myId;
            alarmMembers.Alarm_id = alarmId;
            
            await this.alarmMembersRepository.save(alarmMembers);
            await this.alarmsRepository.createQueryBuilder('alarms')
                .update(Alarms)
                .set({ member_count: () => 'member_count + 1' })
                .where('id = :id', { id: alarm.id })
                .execute();
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new ForbiddenException('Invalid request');
        } finally {
            await queryRunner.release();
        }
        return 'OK';
        
    }

    private async getAlarmById(alarmId: number) {
        return await this.alarmsRepository.findOneOrFail({ where: { id: alarmId }})
                            .catch(_ => { throw new ForbiddenException() });
    }

}
