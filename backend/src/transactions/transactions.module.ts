import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { FinanceStatisticsController } from './finance-statistics.controller';
import { FinanceStatisticsService } from './finance-statistics.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [TransactionsService, FinanceStatisticsService, PrismaService],
  controllers: [TransactionsController, FinanceStatisticsController],
  exports: [TransactionsService, FinanceStatisticsService],
})
export class TransactionsModule {}
