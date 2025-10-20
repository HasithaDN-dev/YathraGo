import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
} from '@nestjs/common';

import { TransactionsService } from './transactions.service';
import { CreateMultipleChildPaymentsDto } from './dto/create-payment.dto';
import { SubmitMonthsForPaymentDto } from './dto/submit-payment.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  // NOTE: Avoid a top-level catch-all param route here because it will
  // capture specific routes like 'driver' or 'payable-months' and cause
  // ParseInt errors. Use a clearly named route.
  @Get('driver/all/:driverId')
  findByDriver(@Param('driverId', ParseIntPipe) driverId: number) {
    return this.transactionsService.findByDriver(driverId);
  }

  @Get('driver/:driverId')
  async getPaymentsForDriver(
    @Param('driverId', ParseIntPipe) driverId: number,
  ) {
    return this.transactionsService.getPaymentsForDriver(driverId);
  }

  @Post('batch-create')
  // @UseGuards(JwtAuthGuard) // You should protect this
  // @Roles(Role.ADMIN)       // Only Admins should do this
  batchCreatePayments(
    @Body() dto: CreateMultipleChildPaymentsDto, // Expects { "records": [...] }
  ) {
    return this.transactionsService.createMultiplePayments(dto);
  }

  @Get('payable-months/:childid')
  // @UseGuards(JwtAuthGuard)
  // @Roles(Role.PARENT)
  getNextFiveMonthsWithStatus(@Param('childid', ParseIntPipe) childId: number) {
    // We can add logic here to check if the logged-in parent
    // actually owns this child (req.user.id === child.customerId)
    return this.transactionsService.getNextFiveMonthsWithStatus(childId);
  }

  @Post('submit-for-confirmation')
  // @UseGuards(JwtAuthGuard) // You should protect this endpoint
  // @Roles(Role.PARENT)
  submitForConfirmation(@Body() dto: SubmitMonthsForPaymentDto) {
    // In a real app, you would get the customerId from the JWT token (req.user.id)
    // and verify that they are the parent of the dto.childId before proceeding.
    return this.transactionsService.submitMonthsForPhysicalPayment(dto);
  }

  @Get('confirmations-for/:driverid')
  // @UseGuards(JwtAuthGuard)
  // You could protect this so only an ADMIN or the DRIVER themselves can see it
  async getConfirmationsForDriver(
    @Param('driverid', ParseIntPipe) driverId: number,
  ) {
    // This re-uses the exact same service function. No new logic is needed.
    return this.transactionsService.getPendingConfirmations(driverId);
  }

  @Post('create-monthly-records')
  // @UseGuards(JwtAuthGuard)
  // @Roles(Role.ADMIN) // Only admins should trigger this
  async createMonthlyPaymentRecords() {
    // This should be called once a month (e.g., by a cron job or manually by admin)
    // It creates next month's payment records for all users based on last month
    return this.transactionsService.createMonthlyPaymentRecords();
  }

  @Post('accept-confirmation/:paymentId/:driverId')
  // @UseGuards(JwtAuthGuard)
  // @Roles(Role.DRIVER) // Only drivers should accept confirmations
  async acceptPaymentConfirmation(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Param('driverId', ParseIntPipe) driverId: number,
  ) {
    // In a real app, you would get the driverId from the JWT token (req.user.id)
    // and verify that they are the driver of this payment before proceeding.
    return this.transactionsService.acceptPaymentConfirmation(
      paymentId,
      driverId,
    );
  }

  @Get('payment-history/:childid')
  // @UseGuards(JwtAuthGuard)
  // @Roles(Role.PARENT)
  getPaymentHistory(@Param('childid', ParseIntPipe) childId: number) {
    // Get payment history for a specific child
    return this.transactionsService.getPaymentHistory(childId);
  }
}
