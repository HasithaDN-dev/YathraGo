import { Test, TestingModule } from '@nestjs/testing';
import { StaffPassengerService } from './staff-passenger.service';

describe('StaffPassengerService', () => {
  let service: StaffPassengerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaffPassengerService],
    }).compile();

    service = module.get<StaffPassengerService>(StaffPassengerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
