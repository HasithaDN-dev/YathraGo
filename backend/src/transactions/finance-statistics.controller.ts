import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FinanceStatisticsService } from './finance-statistics.service';

@Controller('finance-statistics')
export class FinanceStatisticsController {
  private readonly logger = new Logger(FinanceStatisticsController.name);

  constructor(
    private readonly financeStatisticsService: FinanceStatisticsService,
  ) {}

  @Get('overview')
  async getStatistics(
    @Query('timeRange')
    timeRange: 'today' | 'week' | 'month' | 'year' = 'month',
  ) {
    try {
      return await this.financeStatisticsService.getStatistics(timeRange);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Failed to get statistics: ${errorMessage}`,
        errorStack,
      );
      throw new HttpException(
        'Failed to retrieve finance statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('payment-status-distribution')
  async getPaymentStatusDistribution() {
    try {
      return await this.financeStatisticsService.getPaymentStatusDistribution();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Failed to get payment status distribution: ${errorMessage}`,
        errorStack,
      );
      throw new HttpException(
        'Failed to retrieve payment status distribution',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('top-customers')
  async getTopCustomers(@Query('limit') limitStr?: string) {
    try {
      const limit =
        limitStr && limitStr.trim() !== '' ? parseInt(limitStr, 10) : 5;
      return await this.financeStatisticsService.getTopCustomers(limit);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Failed to get top customers: ${errorMessage}`,
        errorStack,
      );
      throw new HttpException(
        'Failed to retrieve top customers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('recent-payments')
  async getRecentPayments(@Query('limit') limitStr?: string) {
    try {
      const limit =
        limitStr && limitStr.trim() !== '' ? parseInt(limitStr, 10) : 10;
      return await this.financeStatisticsService.getRecentPayments(limit);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Failed to get recent payments: ${errorMessage}`,
        errorStack,
      );
      throw new HttpException(
        'Failed to retrieve recent payments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('risk-indicators')
  async getRiskIndicators() {
    try {
      return await this.financeStatisticsService.getRiskIndicators();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Failed to get risk indicators: ${errorMessage}`,
        errorStack,
      );
      throw new HttpException(
        'Failed to retrieve risk indicators',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('quick-insights')
  async getQuickInsights() {
    try {
      return await this.financeStatisticsService.getQuickInsights();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Failed to get quick insights: ${errorMessage}`,
        errorStack,
      );
      throw new HttpException(
        'Failed to retrieve quick insights',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
