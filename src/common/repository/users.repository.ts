import { Injectable } from '@nestjs/common';
import { Users } from 'src/entities/users.entity';
import { DataSource, Repository } from 'typeorm';
import { UserFindByIdOption, UserFindOption } from '../../users/users.types';

@Injectable()
export class UserRepository extends Repository<Users> {
  constructor(private readonly dataSource: DataSource) {
    super(Users, dataSource.createEntityManager());
  }

  async findById({ id }: UserFindByIdOption) {
    return this.findOneOrFail({
      where: {
        id,
      },
    });
  }
  public async findOneByKey({ id, nickname }: UserFindOption) {
    const qb = this.createQueryBuilder('Users');
    if (id) qb.andWhere('Users.id = :id', { id });
    if (nickname) qb.andWhere('Users.nickname = :nickname', { nickname });
    return qb.getOne();
  }
}
