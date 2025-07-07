import { Test, TestingModule } from '@nestjs/testing';
import { StaffPassengerController } from './staff-passenger.controller';

describe('StaffPassengerController', () => {
  let controller: StaffPassengerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffPassengerController],
    }).compile();

    controller = module.get<StaffPassengerController>(StaffPassengerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
