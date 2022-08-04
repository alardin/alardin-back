import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleOptions } from './typeorm.config';
import { RedisModule } from './redis/redis.module';
import * as Joi from 'joi';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number(),
        KAKAO_ADMIN_KEY: Joi.string(),
        JWT_SECRET: Joi.string(),
        DB_USERNAME: Joi.string(),
        DB_PASSWORD: Joi.string(),
        DB_DATABASE: Joi.string(),
        DB_PORT: Joi.number(),
        DB_HOST: Joi.string(),
        REDIS_HOST: Joi.string(),
        REDIS_PORT: Joi.number(),
      })
    }),
    TypeOrmModule.forRoot(typeOrmModuleOptions),
    MateModule, 
    GameModule, 
    AlarmModule, 
    AssetsModule, 
    UsersModule, PushNotificationModule, KakaoModule, AgoraModule, AuthModule, RedisModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_FILTER,
    useClass: HttpExceptionFilter
  }, {
    provide: APP_GUARD,
    useClass: JwtAuthGuard
  }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(LoggerMiddleWare).forRoutes('*');
  }
}
