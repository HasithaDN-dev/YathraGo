import { Controller, Post, Body } from '@nestjs/common';
import { StaffPassengerService } from './staff-passenger.service';
import { RegisterStaffDto } from './dto/register-staff.dto';

@Controller('staff-passenger')
export class StaffPassengerController {
  constructor(private readonly staffPassengerService: StaffPassengerService) {}

  @Post('register')
  async register(@Body() dto: RegisterStaffDto) {
    return this.staffPassengerService.register(dto);
  }
}
