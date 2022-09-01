import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AlarmPlayRecords } from 'src/entities/alarm.play.records.entity';
import { Alarms } from 'src/entities/alarms.entity';
import { Users } from 'src/entities/users.entity';
import { KakaoModule } from 'src/external/kakao/kakao.module';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [KakaoModule, AuthModule,
        TypeOrmModule.forFeature([Users, Alarms, AlarmPlayRecords])],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
