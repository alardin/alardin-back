import { Injectable } from '@nestjs/common';
import { Mates } from 'src/entities/mates.entity';
import { DataSource, FindOptionsSelect, Repository } from 'typeorm';

export type MateFindOneOption = {
  myId: number;
  mateId: number;
};

export type MateDeleteOption = {
  id: number;
};

@Injectable()
export class MateRepository extends Repository<Mates> {
  constructor(private readonly dataSource: DataSource) {
    super(Mates, dataSource.createEntityManager());
  }
  async findOneMate(
    { myId, mateId }: MateFindOneOption,
    select: FindOptionsSelect<Mates> = {},
  ) {
    return this.findOne({
      where: [
        { Sender_id: myId, Receiver_id: mateId },
        { Sender_id: mateId, Receiver_id: myId },
      ],
      select,
    });
  }

  async softDeleteOne({ id }: MateDeleteOption) {
    return this.softDelete({ id, deleted_at: null });
  }
}
