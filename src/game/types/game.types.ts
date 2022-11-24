export type TPicokeData = {
  User_id: number;
  keyword: string;
  images: string[];
  answerIndex: number;
};

export type TFindCarolData = {
  User_id: number;
  contents: string;
};

export type TManyFestData = {
  User_id: number;
  users: number[];
  totalUsers: number;
  images: string[];
};
