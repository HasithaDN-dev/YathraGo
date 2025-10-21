// src/driver-route/driver-route.module.ts
import { Module } from '@nestjs/common';
import { DriverRouteController } from './driver-route.controller';
import { DriverRouteService } from './driver-route.service';
import { VRPOptimizerService } from './vrp-optimizer.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [DriverRouteController],
  providers: [DriverRouteService, VRPOptimizerService],
  exports: [DriverRouteService, VRPOptimizerService],
})
export class DriverRouteModule {}
