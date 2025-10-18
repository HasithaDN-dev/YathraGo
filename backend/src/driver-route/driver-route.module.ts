import { Module } from '@nestjs/common';
import { DriverRouteService } from './driver-route.service';
import { DriverRouteController } from './driver-route.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GoogleService } from './google.service';

@Module({
  imports: [PrismaModule],
  providers: [DriverRouteService, GoogleService],
  controllers: [DriverRouteController],
})
export class DriverRouteModule {}
