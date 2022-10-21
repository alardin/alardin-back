import { CacheModule, Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MateModule } from './mate/mate.module';
import { GameModule } from './game/game.module';
import { AlarmModule } from './alarm/alarm.module';
import { AssetsModule } from './assets/assets.module';
import { LoggerMiddleWare } from './common/middlewares/logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PushNotificationModule } from './push-notification/push-notification.module';
import { KakaoModule } from './external/kakao/kakao.module';
import { AgoraModule } from './external/agora/agora.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AwsService } from './aws/aws.service';
import { AwsModule } from './aws/aws.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { ScheduleModule } from '@nestjs/schedule';
import * as redisStore from 'cache-manager-redis-store';
import { MongooseModule } from '@nestjs/mongoose'
import { AlarmMembers } from './entities/alarm.members.entity';
import { Alarms } from './entities/alarms.entity';
import { Mates } from './entities/mates.entity';
import { MateRequestRecords } from './entities/mate-request.records.entity';
import { Users } from './entities/users.entity';
import { Games } from './entities/games.entity';
import { GameMeta, GameMetaSchema } from './schemas/gameMeta.schemas';
dotenv.config();

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
        type: 'mysql',
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        port: +process.env.DB_PORT,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        entities: [__dirname + '/**/**/*.entity{.ts,.js}'],
        migrations: ['../src/migrations/*.ts'],
        logging: true,
        synchronize: false,
        timezone: 'UTC'
    }),
    TypeOrmModule.forFeature([AlarmMembers, Alarms, Mates, MateRequestRecords, Users, Games]),
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT
    }),
    MongooseModule.forRoot(`mongodb://${process.env.MONGODB_HOST}/${process.env.MONGODB_DB}`),
    MongooseModule.forFeature([
      { name: GameMeta.name, schema: GameMetaSchema },
    ]),
    MateModule,
    GameModule, 
    AlarmModule,
    AgoraModule, 
    AssetsModule, PushNotificationModule, KakaoModule, AgoraModule, AwsModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_FILTER,
    useClass: HttpExceptionFilter
  }, {
    provide: APP_GUARD,
    useClass: JwtAuthGuard
  }, AwsService, Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(LoggerMiddleWare).forRoutes('*');
  }
}
