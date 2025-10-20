import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PayoutsService } from './payouts.service';
import { RefundsService } from './refunds.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PayoutsService, RefundsService],
  exports: [PaymentsService, PayoutsService, RefundsService],
})
export class PaymentsModule {}
