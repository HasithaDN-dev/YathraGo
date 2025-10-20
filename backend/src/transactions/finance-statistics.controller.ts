import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { FinanceStatisticsService } from './finance-statistics.service';

@Controller('finance-statistics')
export class FinanceStatisticsController {
  constructor(
    private readonly financeStatisticsService: FinanceStatisticsService,
  ) {}

  @Get('overview')
  async getStatistics(
    @Query('timeRange') timeRange: 'today' | 'week' | 'month' | 'year' = 'month',
  ) {
    return this.financeStatisticsService.getStatistics(timeRange);
  }

  @Get('payment-status-distribution')
  async getPaymentStatusDistribution() {
    return this.financeStatisticsService.getPaymentStatusDistribution();
  }

  @Get('top-customers')
  async getTopCustomers(@Query('limit', ParseIntPipe) limit: number = 5) {
    return this.financeStatisticsService.getTopCustomers(limit);
  }

  @Get('recent-payments')
  async getRecentPayments(@Query('limit', ParseIntPipe) limit: number = 10) {
    return this.financeStatisticsService.getRecentPayments(limit);
  }

  @Get('risk-indicators')
  async getRiskIndicators() {
    return this.financeStatisticsService.getRiskIndicators();
  }

  @Get('quick-insights')
  async getQuickInsights() {
    return this.financeStatisticsService.getQuickInsights();
  }
}
