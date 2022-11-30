import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { QueryRunnerProvider } from 'src/db/query-runner/query-runner';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { AlarmResults } from 'src/entities/alarm.results.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { DataSource, Repository } from 'typeorm';
import {
  AlarmFindOption,
  AlarmMemberDeleteOption,
  AlarmMemberSaveOption,
  AlarmResultSaveOption,
} from '../../alarm/alarm.types';

@Injectable()
export class AlarmRepository extends Repository<Alarms> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly queryRunnerProvider: QueryRunnerProvider,
  ) {
    super(
      Alarms,
      dataSource.createEntityManager(),
      dataSource.createQueryRunner(),
    );
  }
  async findById({ id }: AlarmFindOption) {
    return this.findOneOrFail({
      where: {
        id,
      },
    });
  }

  async findDetail({ id }: AlarmFindOption) {
    return this.findOneOrFail({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
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
        Members: {
          id: true,
          nickname: true,
          thumbnail_image_url: true,
        },
      },
      relations: {
        Game: true,
        Members: true,
      },
    });
  }

  async quitMember({
    alarmId,
    userId,
    entityManager,
  }: AlarmMemberDeleteOption) {
    if (entityManager) {
      await entityManager.delete(AlarmMembers, {
        Alarm_id: alarmId,
        User_id: userId,
      });
      await entityManager.update(
        Alarms,
        { id: alarmId },
        {
          member_count: () => 'member_count - 1',
        },
      );
    } else {
      await this.dataSource.getRepository(AlarmMembers).delete({
        Alarm_id: alarmId,
        User_id: userId,
      });
      await this.update(
        { id: alarmId },
        { member_count: () => 'member_count - 1' },
      );
    }
  }

  async saveMember({ alarmId, userId, entityManager }: AlarmMemberSaveOption) {
    const newMember = new AlarmMembers();
    newMember.Alarm_id = alarmId;
    newMember.User_id = userId;
    if (entityManager) {
      return entityManager.save(newMember);
    } else {
      return this.dataSource.getRepository(AlarmMembers).save(newMember);
    }
  }

  async addMember({ alarmId, userId, entityManager }: AlarmMemberDeleteOption) {
    await entityManager.withRepository(this).saveMember({
      alarmId,
      userId,
      entityManager,
    });

    await entityManager.update(
      Alarms,
      { id: alarmId },
      { member_count: () => 'member_count + 1' },
    );
  }

  async saveResult(option: AlarmResultSaveOption) {
    const { entityManager, ...body } = option;
    let newResult = new AlarmResults();
    for (let key in body) {
      newResult[key] = body[key];
    }

    if (option.entityManager) {
      return entityManager.save(newResult);
    } else {
      return this.dataSource.getRepository(AlarmResults).save(newResult);
    }
  }
}
