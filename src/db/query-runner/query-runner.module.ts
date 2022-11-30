import { Module } from '@nestjs/common';
import { QueryRunnerProvider } from './query-runner';

@Module({
  providers: [QueryRunnerProvider],
  exports: [QueryRunnerProvider],
})
export class QueryRunnerModule {}
