import { Test, TestingModule } from '@nestjs/testing';
import { ChildController } from './child.controller';

describe('ChildController', () => {
  let controller: ChildController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChildController],
    }).compile();

    controller = module.get<ChildController>(ChildController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
