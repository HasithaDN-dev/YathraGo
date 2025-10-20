import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PayoutsService } from './payouts.service';
import { RefundsService } from './refunds.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentFilterDto } from './dto/payment-filter.dto';
import { ApprovePayoutDto } from './dto/approve-payout.dto';
import { CreateRefundDto } from './dto/create-refund.dto';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly payoutsService: PayoutsService,
    private readonly refundsService: RefundsService,
  ) {}

  // Payment endpoints
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPayment(@Body() dto: CreatePaymentDto) {
    try {
      return await this.paymentsService.createPayment(dto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create payment: ${errorMessage}`);
      throw error instanceof HttpException
        ? error
        : new HttpException(
            'Failed to create payment',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    }
  }

  @Get()
  async findAllPayments(@Query() filterDto: PaymentFilterDto) {
    try {
      return await this.paymentsService.findAll(filterDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch payments: ${errorMessage}`);
      throw new HttpException(
        'Failed to fetch payments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('statistics')
  async getPaymentStatistics() {
    try {
      return await this.paymentsService.getPaymentStatistics();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get payment statistics: ${errorMessage}`);
      throw new HttpException(
        'Failed to retrieve payment statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOnePayment(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.paymentsService.findOne(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to find payment ${id}: ${errorMessage}`);
      throw error instanceof HttpException
        ? error
        : new HttpException(
            'Failed to find payment',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    }
  }

  @Patch(':id/verify')
  async verifyPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body('verifiedBy', ParseIntPipe) verifiedBy: number,
  ) {
    try {
      return await this.paymentsService.verifyPayment(id, verifiedBy);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to verify payment ${id}: ${errorMessage}`);
      throw error instanceof HttpException
        ? error
        : new HttpException(
            'Failed to verify payment',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    }
  }

  @Patch(':id/mark-paid')
  async markAsPaid(
    @Param('id', ParseIntPipe) id: number,
    @Body('amount') amount: number,
    @Body('transactionRef') transactionRef?: string,
  ) {
    try {
      return await this.paymentsService.markAsPaid(id, amount, transactionRef);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to mark payment ${id} as paid: ${errorMessage}`,
      );
      throw error instanceof HttpException
        ? error
        : new HttpException(
            'Failed to mark payment as paid',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    }
  }

  // Payout endpoints
  @Get('payouts/pending')
  async getPendingPayouts() {
    try {
      return await this.payoutsService.getPendingPayouts();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get pending payouts: ${errorMessage}`);
      throw new HttpException(
        'Failed to retrieve pending payouts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('payouts/driver/:driverId')
  async getDriverPayoutHistory(
    @Param('driverId', ParseIntPipe) driverId: number,
    @Query('limit') limitStr?: string,
  ) {
    try {
      const limit =
        limitStr && limitStr.trim() !== '' ? parseInt(limitStr, 10) : undefined;
      return await this.payoutsService.getPayoutHistory(driverId, limit);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get payout history for driver ${driverId}: ${errorMessage}`,
      );
      throw new HttpException(
        'Failed to retrieve payout history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('payouts/calculate')
  async calculatePayout(
    @Body('driverId', ParseIntPipe) driverId: number,
    @Body('month', ParseIntPipe) month: number,
    @Body('year', ParseIntPipe) year: number,
  ) {
    try {
      return await this.payoutsService.calculateDriverPayout(
        driverId,
        month,
        year,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to calculate payout for driver ${driverId}: ${errorMessage}`,
      );
      throw new HttpException(
        'Failed to calculate payout',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('payouts/approve')
  @HttpCode(HttpStatus.OK)
  async approvePayout(@Body() dto: ApprovePayoutDto) {
    try {
      return await this.payoutsService.approvePayout(dto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to approve payout: ${errorMessage}`);
      throw new HttpException(
        'Failed to approve payout',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Refund endpoints
  @Post('refunds')
  @HttpCode(HttpStatus.CREATED)
  async requestRefund(@Body() dto: CreateRefundDto) {
    try {
      return await this.refundsService.requestRefund(dto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to request refund: ${errorMessage}`);
      throw error instanceof HttpException
        ? error
        : new HttpException(
            'Failed to request refund',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    }
  }

  @Get('refunds')
  @UsePipes(new ValidationPipe({ transform: false }))
  async getAllRefunds(
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
    @Query('status') status?: string,
  ) {
    try {
      const page =
        pageStr && pageStr.trim() !== '' ? parseInt(pageStr, 10) : undefined;
      const limit =
        limitStr && limitStr.trim() !== '' ? parseInt(limitStr, 10) : undefined;
      return await this.refundsService.findAll(page, limit, status);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get refunds: ${errorMessage}`);
      throw new HttpException(
        'Failed to retrieve refunds',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('refunds/statistics')
  async getRefundStatistics() {
    try {
      return await this.refundsService.getStatistics();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get refund statistics: ${errorMessage}`);
      throw new HttpException(
        'Failed to retrieve refund statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('refunds/:id')
  async findOneRefund(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.refundsService.findOne(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to find refund ${id}: ${errorMessage}`);
      throw error instanceof HttpException
        ? error
        : new HttpException(
            'Failed to find refund',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    }
  }

  @Patch('refunds/:id/approve')
  async approveRefund(
    @Param('id', ParseIntPipe) id: number,
    @Body('approverId', ParseIntPipe) approverId: number,
    @Body('approverType') approverType: any,
    @Body('refundMethod') refundMethod?: string,
    @Body('transactionRef') transactionRef?: string,
  ) {
    try {
      return await this.refundsService.approveRefund(
        id,
        approverId,
        approverType,
        refundMethod,
        transactionRef,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to approve refund ${id}: ${errorMessage}`);
      throw error instanceof HttpException
        ? error
        : new HttpException(
            'Failed to approve refund',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    }
  }

  @Patch('refunds/:id/reject')
  async rejectRefund(
    @Param('id', ParseIntPipe) id: number,
    @Body('rejectorId', ParseIntPipe) rejectorId: number,
    @Body('rejectionReason') rejectionReason: string,
  ) {
    try {
      return await this.refundsService.rejectRefund(
        id,
        rejectorId,
        rejectionReason,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to reject refund ${id}: ${errorMessage}`);
      throw error instanceof HttpException
        ? error
        : new HttpException(
            'Failed to reject refund',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    }
  }
}
