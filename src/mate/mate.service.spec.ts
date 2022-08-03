import { Test, TestingModule } from '@nestjs/testing';
import { MateService } from './mate.service';

describe('MateService', () => {
  let service: MateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MateService],
    }).compile();

    service = module.get<MateService>(MateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
