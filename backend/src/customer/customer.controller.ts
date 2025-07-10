import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { SendOtpDto, VerifyOtpDto } from '../common/dto/auth.dto';
import { UserType } from '@prisma/client';
import { RegisterStaffPassengerDto } from './dto/register_staff_passenger.dto';
import { RegisterChildDto } from './dto/register-child.dto';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {
  constructor(
    private authService: AuthService,
    private readonly customerService: CustomerService,
  ) {}

  @Post('auth/get-started/send-otp')
  @HttpCode(HttpStatus.OK)
  async sendGetStartedOtp(@Body() body: { phone: string }) {
    const sendOtpDto: SendOtpDto = {
      ...body,
      userType: UserType.CUSTOMER,
    };
    return this.authService.sendGetStartedOtp(sendOtpDto);
  }

  @Post('auth/get-started/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyGetStartedOtp(@Body() body: { phone: string; otp: string }) {
    const verifyOtpDto: VerifyOtpDto = {
      ...body,
      userType: UserType.CUSTOMER,
    };
    return this.authService.verifyGetStartedOtp(verifyOtpDto);
  }

  @Post('register-staff-passenger')
  @HttpCode(HttpStatus.OK)
  async registerStaffPassenger(@Body() dto: RegisterStaffPassengerDto) {
    return this.customerService.registerStaffPassenger(dto);
  }
  @Post('register-child')
  @HttpCode(HttpStatus.OK)
  async registerChild(@Body() dto: RegisterChildDto) {
    return this.customerService.registerChild(dto);
  }
}
