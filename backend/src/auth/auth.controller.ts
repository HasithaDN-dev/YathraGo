import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserType } from '@prisma/client';

interface AuthenticatedRequest {
  user: {
    sub: string;
    phone: string;
    userType: UserType;
    isVerified: boolean;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Customer authentication endpoints
  @Post('customer/send-otp')
  @HttpCode(HttpStatus.OK)
  async sendCustomerOtp(@Body() body: { phone: string }) {
    const sendOtpDto = {
      phone: body.phone,
      userType: 'CUSTOMER' as const,
    };
    return this.authService.sendGetStartedOtp(sendOtpDto);
  }

  @Post('customer/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyCustomerOtp(@Body() body: { phone: string; otp: string }) {
    const verifyOtpDto = {
      phone: body.phone,
      otp: body.otp,
      userType: 'CUSTOMER' as const,
    };
    return this.authService.verifyGetStartedOtp(verifyOtpDto);
  }

  @Post('customer/refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  refreshCustomerToken(@Request() req: AuthenticatedRequest) {
    return this.authService.refreshToken(req.user);
  }

  @Post('customer/validate-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  validateCustomerToken(@Request() req: AuthenticatedRequest) {
    return {
      valid: true,
      user: req.user,
      message: 'Token is valid',
    };
  }

  @Post('customer/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logoutCustomer(@Request() req: AuthenticatedRequest) {
    return this.authService.logout(req.user);
  }

  // Driver authentication endpoints
  @Post('driver/send-otp')
  @HttpCode(HttpStatus.OK)
  async sendDriverOtp(@Body() body: { phone: string }) {

    console.log('Received body:', body); // Debug log
    
    if (!body || !body.phone) {
      throw new Error('Phone number is required');
    }
    const sendOtpDto = {
      phone: body.phone,
      userType: 'DRIVER' as const,
    };
    return this.authService.sendGetStartedOtp(sendOtpDto);
  }

  @Post('driver/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyDriverOtp(@Body() body: { phone: string; otp: string }) {
    const verifyOtpDto = {
      phone: body.phone,
      otp: body.otp,
      userType: 'DRIVER' as const,
    };
    return this.authService.verifyGetStartedOtp(verifyOtpDto);
  }

  @Post('driver/refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  refreshDriverToken(@Request() req: AuthenticatedRequest) {
    return this.authService.refreshToken(req.user);
  }

  @Post('driver/validate-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  validateDriverToken(@Request() req: AuthenticatedRequest) {
    return {
      valid: true,
      user: req.user,
      message: 'Token is valid',
    };
  }

  @Post('driver/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logoutDriver(@Request() req: AuthenticatedRequest) {
    return this.authService.logout(req.user);
  }

  // Utility endpoints for mobile apps
  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  validateToken(@Request() req: AuthenticatedRequest) {
    return {
      valid: true,
      user: req.user,
      message: 'Token is valid',
    };
  }
}
