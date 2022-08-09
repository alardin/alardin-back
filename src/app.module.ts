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
import { RedisModule } from './redis/redis.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AwsService } from './aws/aws.service';
import { AwsModule } from './aws/aws.module';
import { join } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME, 
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [join(__dirname + '../entites/**/*.entity.ts')],
      logging: true,
      synchronize: false,
      migrations: [process.env.NODE_ENV === 'production' ? join(__dirname, '../../dist/migrations/*{.ts,.js}') 
                      : join(__dirname, '../migrations/*{.ts,.js}')],
      migrationsTableName: 'migrations',
  }),
    MateModule, 
    GameModule, 
    AlarmModule, 
    AssetsModule, 
    UsersModule, PushNotificationModule, KakaoModule, AgoraModule, AuthModule, RedisModule, AwsModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_FILTER,
    useClass: HttpExceptionFilter
  }, {
    provide: APP_GUARD,
    useClass: JwtAuthGuard
  }, AwsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(LoggerMiddleWare).forRoutes('*');
  }
}
