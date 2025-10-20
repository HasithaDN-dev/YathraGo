import { Module } from '@nestjs/common';
import { DriverLocationGateway } from './driver-location.gateway';
import { DriverLocationService } from './driver-location.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DriverLocationGateway, DriverLocationService],
  exports: [DriverLocationService],
})
export class DriverLocationModule {}
