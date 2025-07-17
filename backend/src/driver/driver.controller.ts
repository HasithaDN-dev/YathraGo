// src/driver/driver.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { CompleteDriverRegistrationDto } from './dto/complete-driver-registration.dto'; // Import the new DTO
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Your existing JwtAuthGuard
import { UserType } from '@prisma/client';
import { Request } from 'express';

// Extend Request to include user property from JwtPayload
// This interface MUST match what your JwtStrategy returns in its validate method.
// Based on your provided JwtStrategy, it returns:
// { userId: string, phone: string, userType: UserType, isVerified: boolean }
interface AuthenticatedRequest extends Request {
  user: {
    userId: string; // This is payload.sub (driver_id or customer_id as string)
    phone: string;
    userType: UserType;
    isVerified: boolean;
  };
}

@Controller('driver') // Base route for driver-related operations
export class DriverController {
  constructor(private driverService: DriverService) {}

  // --- NEW ENDPOINT FOR SINGLE-PHASE DRIVER REGISTRATION (SECURE) ---
  @UseGuards(JwtAuthGuard) // Protect with JWT Guard
  @Post('register') // A single endpoint for the complete registration
  @HttpCode(HttpStatus.OK)
  async registerDriver(
    @Req() req: AuthenticatedRequest, // Get authenticated user info
    @Body() registrationData: CompleteDriverRegistrationDto,
  ) {
    const phone = req.user.phone; // Securely get phone from JWT
    return this.driverService.completeDriverRegistration(
      phone,
      registrationData,
    );
  }

  // --- EXISTING PROFILE MANAGEMENT ENDPOINTS (from your provided driver.service.ts) ---
  // You would need to add these back if you want them exposed via the controller.
  // Example:
  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // @HttpCode(HttpStatus.OK)
  // async getDriverProfile(@Req() req: AuthenticatedRequest) {
  //   const driverId = req.user.userId; // Assuming userId is driver_id
  //   return this.driverService.getDriverProfile(driverId);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Put('profile')
  // @HttpCode(HttpStatus.OK)
  // async updateDriverProfile(@Req() req: AuthenticatedRequest, @Body() profileData: UpdateDriverProfileDto) {
  //   const driverId = req.user.userId;
  //   return this.driverService.updateDriverProfile(driverId, profileData);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Post('documents')
  // @HttpCode(HttpStatus.OK)
  // async uploadDriverDocuments(@Req() req: AuthenticatedRequest, @Body() documentsData: UploadDocumentsDto) {
  //   const driverId = req.user.userId;
  //   return this.driverService.uploadDriverDocuments(driverId, documentsData);
  // }
}
