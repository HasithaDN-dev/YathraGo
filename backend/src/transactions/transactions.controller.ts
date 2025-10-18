import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
} from '@nestjs/common';

import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly TransactionsService: TransactionsService) {}

  @Get()
  findAll() {
    return this.TransactionsService.findAll();
  }

  @Get('/:driverid')
  findByDriver(@Param('driverid', ParseIntPipe) driverid: number) {
    return this.TransactionsService.findByDriver(driverid);
  }

  @Get('driver/:driverId')
  async getPaymentsForDriver(
    @Param('driverId', ParseIntPipe) driverId: number,
  ) {
    return this.TransactionsService.getPaymentsForDriver(driverId);
  }
}
