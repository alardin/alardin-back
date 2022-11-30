import { EntityManager } from 'typeorm';

export type PicokeData = {
  User_id: number;
  keyword: string;
  images: string[];
  answerIndex: number;
};

export type FindCarolData = {
  User_id: number;
  contents: string;
};

export type ManyFestData = {
  User_id: number;
  users: number[];
  totalUsers: number;
  images: string[];
};

export type TGameData = PicokeData[] | FindCarolData[] | ManyFestData[];

export type WithEntityManager = {
  entityManager?: EntityManager;
};

export type GameUserPair = {
  userId: number;
  gameId: number;
};

export type GameFindOption = {
  id: number;
};
export type GamePurchaseFindOption = GameUserPair;

export type GameRatingSaveOption = GameUserPair &
  WithEntityManager & {
    score: number;
  };
