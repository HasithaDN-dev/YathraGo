import { Module } from '@nestjs/common';
import { DriverCoordinatorController } from './driver-coordinator.controller';
import { DriverCoordinatorService } from './driver-coordinator.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DriverCoordinatorController],
  providers: [DriverCoordinatorService],
  exports: [DriverCoordinatorService],
})
export class DriverCoordinatorModule {}
