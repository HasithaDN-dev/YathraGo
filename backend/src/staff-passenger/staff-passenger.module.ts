import { Module } from '@nestjs/common';
import { StaffPassengerController } from './staff-passenger.controller';
import { StaffPassengerService } from './staff-passenger.service';

@Module({
  controllers: [StaffPassengerController],
  providers: [StaffPassengerService],
})
export class StaffPassengerModule {}
