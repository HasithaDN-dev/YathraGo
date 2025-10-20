import { Module } from '@nestjs/common';
import { ComplaintsInquiriesService } from './complaints-inquiries.service';
import { ComplaintsInquiriesController } from './complaints-inquiries.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ComplaintsInquiriesController],
  providers: [ComplaintsInquiriesService],
  exports: [ComplaintsInquiriesService],
})
export class ComplaintsInquiriesModule {}
