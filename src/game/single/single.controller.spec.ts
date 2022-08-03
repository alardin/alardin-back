import { Test, TestingModule } from '@nestjs/testing';
import { SingleController } from './single.controller';

describe('SingleController', () => {
  let controller: SingleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SingleController],
    }).compile();

    controller = module.get<SingleController>(SingleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
