import { CacheModule, Module } from '@nestjs/common';
import { RedisController } from './redis.controller';
import { RedisService } from './redis.service';
import * as redisStore from 'cache-manager-redis-store';
@Module({
  imports: [CacheModule.register({
    store: redisStore,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  })],
  controllers: [RedisController],
  providers: [RedisService],
  exports: [RedisService]
})
export class RedisModule {}
