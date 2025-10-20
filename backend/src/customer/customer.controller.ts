import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  Put,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { RegisterStaffPassengerDto } from './dto/register_staff_passenger.dto';
import { RegisterChildDto } from './dto/register-child.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { CustomerRegisterDto } from './dto/customer-register.dto';
import { CustomerService } from './customer.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // Upload child profile image

  @Post('upload-child-image')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'child');
          console.log('[CHILD UPLOAD] Destination path:', uploadPath);
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          const uniqueName = `child-${Date.now()}${ext}`;
          console.log('[CHILD UPLOAD] Generated filename:', uniqueName);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  uploadChildImage(@UploadedFile() file: Express.Multer.File) {
    console.log(
      '[CHILD UPLOAD] File received:',
      file ? file.filename : 'No file',
    );
    console.log('[CHILD UPLOAD] File path:', file ? file.path : 'No path');
    // Attach subfolder info for child images
    if (file) {
      file.filename = `child/${file.filename}`;
    }
    return this.customerService.handleImageUpload(file);
  }

  // Upload customer profile image

  @Post('upload-profile-image')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, path.join(__dirname, '../../uploads/customer'));
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          const base = path.basename(file.originalname, ext);
          const uniqueName = `${base}_${Date.now()}${ext}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
    return this.customerService.handleImageUpload(file);
  }

  // Complete customer registration after OTP verification
  @Post('customer-register')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async customerRegister(@Body() dto: CustomerRegisterDto) {
    const result = await this.customerService.completeCustomerRegistration(dto);
    return result;
  }

  // Customer business logic endpoints (registration flows)
  @Post('register-staff-passenger')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async registerStaffPassenger(@Body() dto: RegisterStaffPassengerDto) {
    console.log(
      '[DEBUG] Staff Passenger Registration - Request received:',
      JSON.stringify(dto, null, 2),
    );
    const result = await this.customerService.registerStaffPassenger(dto);
    console.log(
      '[DEBUG] Staff Passenger Registration - Response:',
      JSON.stringify(result, null, 2),
    );
    return result;
  }

  @Post('register-child')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async registerChild(@Body() dto: RegisterChildDto) {
    console.log(
      '[BACKEND] [CONTROLLER] Child Registration - DTO received:',
      JSON.stringify(dto, null, 2),
    );
    console.log(
      '[BACKEND] [CONTROLLER] Type of customerId:',
      typeof dto.customerId,
      dto.customerId,
    );
    console.log(
      '[BACKEND] [CONTROLLER] DTO prototype:',
      Object.getPrototypeOf(dto),
    );
    for (const key of Object.keys(dto)) {
      console.log(
        `[BACKEND] [CONTROLLER] Property: ${key}, Type:`,
        typeof dto[key],
        ', Value:',
        dto[key],
      );
    }
    const result = await this.customerService.registerChild(dto);
    console.log(
      '[DEBUG] Child Registration - Response:',
      JSON.stringify(result, null, 2),
    );
    return result;
  }

  // Customer profile management
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: AuthenticatedRequest) {
    console.log('[DEBUG] Get Profile - User ID:', req.user.sub);
    const result = await this.customerService.getCustomerProfile(req.user.sub);
    console.log(
      '[DEBUG] Get Profile - Response:',
      JSON.stringify(result, null, 2),
    );
    return result;
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateCustomerProfile(
    @Body() profileData: UpdateProfileDto,
    @Request() req: AuthenticatedRequest,
  ) {
    console.log(
      '[DEBUG] Update Customer Profile - Request data:',
      JSON.stringify(profileData, null, 2),
    );
    console.log('[DEBUG] Update Customer Profile - User ID:', req.user.sub);
    const result = await this.customerService.updateCustomerProfile(
      Number(req.user.sub),
      profileData,
    );
    console.log(
      '[DEBUG] Update Customer Profile - Response:',
      JSON.stringify(result, null, 2),
    );
    return result;
  }

  // Update child profile by ID
  @Put('child/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateChildProfile(
    @Param('id', ParseIntPipe) childId: number,
    @Body() childData: UpdateChildDto,
    @Request() req: AuthenticatedRequest,
  ) {
    console.log(
      '[DEBUG] Update Child Profile - Child ID:',
      childId,
      'Request data:',
      JSON.stringify(childData, null, 2),
    );
    try {
      const result = await this.customerService.updateChildProfile(
        childId,
        childData,
        Number(req.user.sub),
      );
      console.log(
        '[DEBUG] Update Child Profile - Response:',
        JSON.stringify(result, null, 2),
      );
      return result;
    } catch (error) {
      console.error('[DEBUG] Update Child Profile - Error:', error);
      throw error;
    }
  }

  // Update staff profile by customer ID
  @Put('staff')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateStaffProfile(
    @Body() staffData: UpdateStaffDto,
    @Request() req: AuthenticatedRequest,
  ) {
    console.log(
      '[DEBUG] Update Staff Profile - Request data:',
      JSON.stringify(staffData, null, 2),
    );
    const result = await this.customerService.updateStaffProfile(
      Number(req.user.sub),
      staffData,
    );
    console.log(
      '[DEBUG] Update Staff Profile - Response:',
      JSON.stringify(result, null, 2),
    );
    return result;
  }

  // Legacy endpoint for backward compatibility
  @Post('update-profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body() profileData: UpdateProfileDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.updateCustomerProfile(profileData, req);
  }

  // Get assigned child ride
  @Get('assigned-ride/child/:childId')
  @UseGuards(JwtAuthGuard)
  async getAssignedChildRide(
    @Param('childId', ParseIntPipe) childId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.customerService.getAssignedChildRide(
      childId,
      Number(req.user.sub),
    );
  }

  // Get assigned staff ride
  @Get('assigned-ride/staff')
  @UseGuards(JwtAuthGuard)
  async getAssignedStaffRide(@Request() req: AuthenticatedRequest) {
    return this.customerService.getAssignedStaffRide(Number(req.user.sub));
  }
}
