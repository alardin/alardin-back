import { Test, TestingModule } from '@nestjs/testing';
import { MateController } from './mate.controller';

describe('MateController', () => {
  let controller: MateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MateController],
    }).compile();

    controller = module.get<MateController>(MateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
