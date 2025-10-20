import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DriverCoordinatorService } from './driver-coordinator.service';

@Controller('driver-coordinator')
export class DriverCoordinatorController {
  constructor(
    private readonly driverCoordinatorService: DriverCoordinatorService,
  ) {}

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  async getStatistics() {
    return this.driverCoordinatorService.getStatistics();
  }

  @Get('pending-verifications')
  @HttpCode(HttpStatus.OK)
  async getPendingVerifications(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.driverCoordinatorService.getPendingVerifications(page, limit);
  }

  @Get('active-drivers')
  @HttpCode(HttpStatus.OK)
  async getActiveDrivers(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.driverCoordinatorService.getActiveDrivers(page, limit);
  }

  @Get('safety-alerts')
  @HttpCode(HttpStatus.OK)
  async getSafetyAlerts(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.driverCoordinatorService.getSafetyAlerts(page, limit);
  }

  @Post('drivers/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveDriver(@Param('id', ParseIntPipe) id: number) {
    return this.driverCoordinatorService.approveDriver(id);
  }

  @Post('drivers/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectDriver(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
  ) {
    return this.driverCoordinatorService.rejectDriver(id, reason);
  }

  @Get('pending-vehicles')
  @HttpCode(HttpStatus.OK)
  async getPendingVehicles(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return await this.driverCoordinatorService.getPendingVehicles(page, limit);
  }

  @Post('vehicles/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveVehicle(@Param('id', ParseIntPipe) id: number) {
    return await this.driverCoordinatorService.approveVehicle(id);
  }

  @Post('vehicles/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectVehicle(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
  ) {
    return await this.driverCoordinatorService.rejectVehicle(id, reason);
  }

  @Get('inquiries')
  @HttpCode(HttpStatus.OK)
  async getDriverInquiries(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    return await this.driverCoordinatorService.getDriverInquiries(page, limit, status, category);
  }

  @Get('inquiries/statistics')
  @HttpCode(HttpStatus.OK)
  async getInquiryStatistics() {
    return await this.driverCoordinatorService.getInquiryStatistics();
  }

  @Patch('inquiries/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateInquiryStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return await this.driverCoordinatorService.updateInquiryStatus(id, status);
  }
}
