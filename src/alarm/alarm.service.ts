import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { exec } from 'child_process';
import { validate } from 'class-validator';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { MateService } from 'src/mate/mate.service';
import { DataSource, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CreateAlarmDto } from './dto/create.alarm.dto';

@Injectable()
export class AlarmService {
    constructor(
        private readonly mateService: MateService,
        @InjectRepository(Alarms)
        private readonly alarmsRepository: Repository<Alarms>,
        @InjectRepository(AlarmMembers)
        private readonly alarmMembersRepository: Repository<AlarmMembers>,
        private dataSource: DataSource
    ) {}

    async makeNewAlarm(myId: number, body: CreateAlarmDto) {
        let newAlarm: Alarms;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            newAlarm = await queryRunner.manager.getRepository(Alarms).save({
                Host_id: myId,
                member_count: 1,
                ...body
            });

            await queryRunner.manager.getRepository(AlarmMembers).save({
                Alarm_id: newAlarm.id,
                User_id: myId
            });
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Transaction Error');

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
            throw new InternalServerErrorException();
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
