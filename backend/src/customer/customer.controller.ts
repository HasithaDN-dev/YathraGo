import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RegisterStaffPassengerDto } from './dto/register_staff_passenger.dto';
import { RegisterChildDto } from './dto/register-child.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CustomerRegisterDto } from './dto/customer-register.dto';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // GET ALL CUSTOMERS - For admin dashboard
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAllCustomers() {
    return this.customerService.getAllCustomers();
  }

  // GET USER COUNTS BY ROLE - For admin dashboard
  @Get('counts')
  @HttpCode(HttpStatus.OK)
  async getUserCounts() {
    return this.customerService.getUserCounts();
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

  @Post('update-profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body() profileData: UpdateProfileDto,
    @Request() req: AuthenticatedRequest,
  ) {
    console.log(
      '[DEBUG] Update Profile - Request data:',
      JSON.stringify(profileData, null, 2),
    );
    console.log('[DEBUG] Update Profile - User ID:', req.user.sub);
    const result = await this.customerService.updateCustomerProfile(
      req.user.sub,
      profileData,
    );
    console.log(
      '[DEBUG] Update Profile - Response:',
      JSON.stringify(result, null, 2),
    );
    return result;
  }
}
