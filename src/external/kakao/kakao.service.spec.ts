import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { KakaoService } from './kakao.service';

describe('KakaoService', () => {
  let service: KakaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([Users])],
      providers: [KakaoService],
    }).compile();

    service = module.get<KakaoService>(KakaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
