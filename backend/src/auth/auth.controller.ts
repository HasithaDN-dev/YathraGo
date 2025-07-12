import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto } from '../common/dto/auth.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  healthCheck() {
    this.logger.log('Health check endpoint called');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth',
    };
  }

  @Post('get-started/send-otp')
  @HttpCode(HttpStatus.OK)
  async sendGetStartedOtp(@Body() sendOtpDto: SendOtpDto) {
    this.logger.log(`OTP send request received for phone: ${sendOtpDto.phone}`);
    
    // Additional phone number validation
    if (!sendOtpDto.phone.match(/^\+94[0-9]{9}$/)) {
      this.logger.warn(`Invalid phone number format: ${sendOtpDto.phone}`);
      return {
        success: false,
        error:
          'Phone number must be exactly 9 digits after +94 (e.g., +94736554890)',
      };
    }

    try {
      const result = await this.authService.sendGetStartedOtp(sendOtpDto);
      this.logger.log(`OTP send result: ${JSON.stringify(result)}`);
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`OTP send error: ${errorMessage}`, errorStack);
      
      // Return user-friendly error messages
      if (errorMessage.includes('Phone number must be')) {
        return {
          success: false,
          error: errorMessage,
        };
      }
      
      return {
        success: false,
        error: 'Unable to send OTP. Please try again later.',
      };
    }
  }

  @Post('get-started/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyGetStartedOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    this.logger.log(
      `OTP verify request received for phone: ${verifyOtpDto.phone}`,
    );

    // Additional validation
    if (!verifyOtpDto.phone.match(/^\+94[0-9]{9}$/)) {
      this.logger.warn(`Invalid phone number format: ${verifyOtpDto.phone}`);
      return {
        success: false,
        error: 'Phone number must be exactly 9 digits after +94',
      };
    }

    if (!verifyOtpDto.otp.match(/^[0-9]{6}$/)) {
      this.logger.warn(`Invalid OTP format: ${verifyOtpDto.otp}`);
      return {
        success: false,
        error: 'OTP must be exactly 6 digits',
      };
    }

    try {
      const result = await this.authService.verifyGetStartedOtp(verifyOtpDto);
      this.logger.log(
        `OTP verify result: ${JSON.stringify({ success: result.accessToken ? true : false })}`,
      );
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`OTP verify error: ${errorMessage}`, errorStack);
      
      // Return user-friendly error messages
      if (errorMessage.includes('Invalid OTP code')) {
        return {
          success: false,
          error: 'Wrong OTP. Enter the correct OTP',
        };
      }
      
      if (errorMessage.includes('expired')) {
        return {
          success: false,
          error: 'OTP has expired. Please request a new one',
        };
      }
      
      if (errorMessage.includes('Too many failed attempts')) {
        return {
          success: false,
          error: 'Too many failed attempts. Please request a new OTP',
        };
      }
      
      return {
        success: false,
        error: 'Unable to verify OTP. Please try again.',
      };
    }
  }
}
