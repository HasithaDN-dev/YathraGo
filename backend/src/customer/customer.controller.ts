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
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // Customer business logic endpoints (registration flows)
  @Post('register-staff-passenger')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async registerStaffPassenger(@Body() dto: RegisterStaffPassengerDto) {
    return this.customerService.registerStaffPassenger(dto);
  }

  @Post('register-child')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async registerChild(@Body() dto: RegisterChildDto) {
    return this.customerService.registerChild(dto);
  }

  // Customer profile management
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.customerService.getCustomerProfile(req.user.sub);
  }

  @Post('update-profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body() profileData: UpdateProfileDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.customerService.updateCustomerProfile(
      req.user.sub,
      profileData,
    );
  }
}
