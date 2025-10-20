import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ManagerService } from './manager.service';

@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  async getStatistics() {
    return this.managerService.getStatistics();
  }

  @Post('reports')
  @HttpCode(HttpStatus.OK)
  async generateReport(
    @Body('reportType') reportType: string,
    @Body('dateFrom') dateFrom?: string,
    @Body('dateTo') dateTo?: string,
  ) {
    const startDate = dateFrom ? new Date(dateFrom) : undefined;
    const endDate = dateTo ? new Date(dateTo) : undefined;
    
    return this.managerService.generateReport(reportType, startDate, endDate);
  }
}
