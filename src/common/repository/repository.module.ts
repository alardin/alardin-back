import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueryRunnerModule } from 'src/db/query-runner/query-runner.module';
import { AlarmMembers } from 'src/entities/alarm.members.entity';
import { GamePurchaseRecords } from 'src/entities/game.purchase.records.entity';
import { AlarmRepository } from './alarm.repository';
import { GameRepository } from './game.repository';
import { MateRepository } from './mate.repository';
import { UserRepository } from './users.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([GamePurchaseRecords, AlarmMembers]),
    QueryRunnerModule,
  ],
  providers: [AlarmRepository, GameRepository, UserRepository, MateRepository],
  exports: [AlarmRepository, GameRepository, UserRepository, MateRepository],
})
export class RepositoryModule {}
