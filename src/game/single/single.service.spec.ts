import { Test, TestingModule } from '@nestjs/testing';
import { SingleService } from './single.service';

describe('SingleService', () => {
  let service: SingleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SingleService],
    }).compile();

    service = module.get<SingleService>(SingleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
