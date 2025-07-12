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
import { DriverService } from './driver.service';
import { UpdateDriverProfileDto } from './dto/update-driver-profile.dto';
import { UploadDocumentsDto } from './dto/upload-documents.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  // Driver business logic endpoints (registration flows)
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.driverService.getDriverProfile(req.user.sub);
  }

  @Post('update-profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body() profileData: UpdateDriverProfileDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.driverService.updateDriverProfile(req.user.sub, profileData);
  }

  @Post('upload-documents')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async uploadDocuments(
    @Body() documentsData: UploadDocumentsDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.driverService.uploadDriverDocuments(
      req.user.sub,
      documentsData,
    );
  }
}
