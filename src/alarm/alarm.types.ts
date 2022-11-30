import { EntityManager } from 'typeorm';

export type WithEntityManager = {
  entityManager?: EntityManager;
};

export type AlarmFindOption = WithEntityManager & {
  id: number;
};

export type AlarmMemberDeleteOption = WithEntityManager & {
  alarmId: number;
  userId: number;
};

export type AlarmMemberSaveOption = AlarmMemberDeleteOption;

export type AlarmResultSaveOption = WithEntityManager & {
  start_time: Date;
  end_time: Date;
  Game_id: number;
  data: { trial: number; play_time: number; data?: object };
  is_cleared: boolean;
  Alarm_id: number;
};
