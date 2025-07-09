import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto } from '../common/dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('get-started/send-otp')
  @HttpCode(HttpStatus.OK)
  async sendGetStartedOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendGetStartedOtp(sendOtpDto);
  }

  @Post('get-started/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyGetStartedOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyGetStartedOtp(verifyOtpDto);
  }
}
