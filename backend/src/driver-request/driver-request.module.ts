import { Module } from '@nestjs/common';
import { DriverRequestController } from './driver-request.controller';
import { DriverRequestService } from './driver-request.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DriverRequestController],
  providers: [DriverRequestService],
  exports: [DriverRequestService],
})
export class DriverRequestModule {}
