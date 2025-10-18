// src/driver-route/driver-route.module.ts
import { Module } from '@nestjs/common';
import { DriverRouteController } from './driver-route.controller';
import { DriverRouteService } from './driver-route.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DriverRouteController],
  providers: [DriverRouteService],
  exports: [DriverRouteService],
})
export class DriverRouteModule {}
