import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assets } from 'src/entities/assets.entity';
import { Users } from 'src/entities/users.entity';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET
    }),
    TypeOrmModule.forFeature([Users, Assets])
  ],
  exports: [AuthService]
})
export class AuthModule {}
