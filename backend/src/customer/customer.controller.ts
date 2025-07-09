import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { SendOtpDto, VerifyOtpDto } from '../common/dto/auth.dto';
import { UserType } from '@prisma/client';

@Controller('customer')
export class CustomerController {
  constructor(private authService: AuthService) {}

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
}
