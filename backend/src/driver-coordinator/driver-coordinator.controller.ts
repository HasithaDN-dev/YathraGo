import { Controller, Get, Post, Patch, Query, Param, Body, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { DriverCoordinatorService } from './driver-coordinator.service';

@Controller('driver-coordinator')
export class DriverCoordinatorController {
  constructor(private readonly driverCoordinatorService: DriverCoordinatorService) {}

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
}
