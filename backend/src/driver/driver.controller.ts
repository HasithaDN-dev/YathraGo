// src/driver/driver.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { CompleteDriverRegistrationDto } from './dto/complete-driver-registration.dto'; // Import the new DTO
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Your existing JwtAuthGuard
import { UserType } from '@prisma/client';
import { Request } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerConfigVehicle } from 'src/common/services/multer.config';

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
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profileImage', maxCount: 1 },
        { name: 'idFrontImage', maxCount: 1 },
        { name: 'idBackImage', maxCount: 1 },
        { name: 'vehicleFrontView', maxCount: 1 },
        { name: 'vehicleSideView', maxCount: 1 },
        { name: 'vehicleRearView', maxCount: 1 },
        { name: 'vehicleInteriorView', maxCount: 1 },
        { name: 'revenueLicense', maxCount: 1 },
        { name: 'vehicleInsurance', maxCount: 1 },
        { name: 'registrationDoc', maxCount: 1 },
        { name: 'licenseFront', maxCount: 1 },
        { name: 'licenseBack', maxCount: 1 },
      ],
      multerConfigVehicle,
    ),
  )
  @HttpCode(HttpStatus.OK)
  async registerDriver(
    @Req() req: AuthenticatedRequest, // Get authenticated user info
    @UploadedFiles()
    files: {
      profileImage?: Express.Multer.File[];
      idFrontImage?: Express.Multer.File[];
      idBackImage?: Express.Multer.File[];
      vehicleFrontView?: Express.Multer.File[];
      vehicleSideView?: Express.Multer.File[];
      vehicleRearView?: Express.Multer.File[];
      vehicleInteriorView?: Express.Multer.File[];
      revenueLicense?: Express.Multer.File[];
      vehicleInsurance?: Express.Multer.File[];
      registrationDoc?: Express.Multer.File[];
      licenseFront?: Express.Multer.File[];
      licenseBack?: Express.Multer.File[];
    },
    @Body() registrationData: any,
  ) {
    const phone = req.user.phone; // Securely get phone from JWT
    
    // Map file fields to URLs
    const profileImageUrl = files.profileImage?.[0]?.filename ? `uploads/vehicle/${files.profileImage[0].filename}` : null;
    const idFrontImageUrl = files.idFrontImage?.[0]?.filename ? `uploads/vehicle/${files.idFrontImage[0].filename}` : null;
    const idBackImageUrl = files.idBackImage?.[0]?.filename ? `uploads/vehicle/${files.idBackImage[0].filename}` : null;
    const vehicleFrontViewUrl = files.vehicleFrontView?.[0]?.filename ? `uploads/vehicle/${files.vehicleFrontView[0].filename}` : null;
    const vehicleSideViewUrl = files.vehicleSideView?.[0]?.filename ? `uploads/vehicle/${files.vehicleSideView[0].filename}` : null;
    const vehicleRearViewUrl = files.vehicleRearView?.[0]?.filename ? `uploads/vehicle/${files.vehicleRearView[0].filename}` : null;
    const vehicleInteriorViewUrl = files.vehicleInteriorView?.[0]?.filename ? `uploads/vehicle/${files.vehicleInteriorView[0].filename}` : null;
    const revenueLicenseUrl = files.revenueLicense?.[0]?.filename ? `uploads/vehicle/${files.revenueLicense[0].filename}` : null;
    const vehicleInsuranceUrl = files.vehicleInsurance?.[0]?.filename ? `uploads/vehicle/${files.vehicleInsurance[0].filename}` : null;
    const registrationDocUrl = files.registrationDoc?.[0]?.filename ? `uploads/vehicle/${files.registrationDoc[0].filename}` : null;
    const licenseFrontUrl = files.licenseFront?.[0]?.filename ? `uploads/vehicle/${files.licenseFront[0].filename}` : null;
    const licenseBackUrl = files.licenseBack?.[0]?.filename ? `uploads/vehicle/${files.licenseBack[0].filename}` : null;

    // Prepare the registration data with file URLs
    const completeRegistrationData: CompleteDriverRegistrationDto = {
      name: `${registrationData.firstName} ${registrationData.lastName}`,
      NIC: registrationData.NIC || 'N/A', // You might need to add NIC field to mobile form
      address: registrationData.city,
      date_of_birth: registrationData.dateOfBirth,
      gender: 'Not specified', // You might want to add this to mobile form
      profile_picture_url: profileImageUrl || '',
      email: registrationData.email || undefined,
      driver_license_front_url: licenseFrontUrl || '',
      driver_license_back_url: licenseBackUrl || '',
      nic_front_pic_url: idFrontImageUrl || '',
      nice_back_pic_url: idBackImageUrl || '',
      second_phone: registrationData.secondaryPhone || undefined,
      vehicle_Reg_No: registrationData.licensePlate || undefined,
    };

    return this.driverService.completeDriverRegistration(
      phone,
      completeRegistrationData,
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
