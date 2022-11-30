import {
  CacheModule,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as redisStore from 'cache-manager-redis-store';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MateModule } from './mate/mate.module';
import { GameModule } from './game/game.module';
import { AlarmModule } from './alarm/alarm.module';
import { AssetsModule } from './assets/assets.module';
import { LoggerMiddleWare } from './common/middlewares/logger.middleware';
import { UsersModule } from './users/users.module';
import { PushNotificationModule } from './push-notification/push-notification.module';
import { KakaoModule } from './external/kakao/kakao.module';
import { AgoraModule } from './external/agora/agora.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AwsService } from './aws/aws.service';
import { AwsModule } from './aws/aws.module';
import { AlarmRepository } from './common/repository/alarm.repository';
import { QueryRunnerProvider } from './db/query-runner/query-runner';
import { Alarms } from './entities/alarms.entity';
import { QueryRunnerModule } from './db/query-runner/query-runner.module';
import { RepositoryModule } from './common/repository/repository.module';
import { UtilsModule } from './common/utils/utils.module';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'envs/.dev.env',
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: +config.get('REDIS_PORT'),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'mysql',
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        port: +config.get('DB_PORT'),
        host: config.get('DB_HOST'),
        database: config.get('DB_DATABASE'),
        entities: [`${__dirname}/**/**/*.entity{.ts,.js}`],
        migrations: ['../../src/migrations/*.ts'],
        logging: config.get('NODE_ENV') === 'development',
        synchronize: false,
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get('MONGODB_URL'),
      }),
    }),
    MateModule,
    GameModule,
    AlarmModule,
    AgoraModule,
    AssetsModule,
    UsersModule,
    PushNotificationModule,
    KakaoModule,
    AgoraModule,
    AuthModule,
    AwsModule,
    QueryRunnerModule,
    RepositoryModule,
    UtilsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AwsService,
    Logger,
    QueryRunnerProvider,
    AlarmRepository,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleWare).forRoutes('*');
  }
}
