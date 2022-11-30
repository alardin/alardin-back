import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

export type PreparedStatement = {
  query: string;
  parameter: any[];
};

@Injectable()
export class QueryRunnerProvider {
  constructor(private readonly dataSource: DataSource) {}
  private readonly queryRunner = this.dataSource.createQueryRunner();

  async init() {
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
    return this.queryRunner.manager;
  }

  async releaseWithRollback() {
    await this.queryRunner.rollbackTransaction();
    await this.queryRunner.release();
  }

  async releaseWithCommit() {
    await this.queryRunner.commitTransaction();
    await this.queryRunner.release();
  }

  async runRawQueryWithTransaction(queries: PreparedStatement[]) {
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
    try {
      queries.map(async q => {
        await this.queryRunner.query(q.query, q.parameter);
      });
      await this.queryRunner.commitTransaction();
    } catch (e) {
      await this.queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await this.queryRunner.release();
    }
  }
}
