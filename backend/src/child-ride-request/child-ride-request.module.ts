import { Module } from '@nestjs/common';
import { ChildRideRequestService } from './child-ride-request.service';
import { ChildRideRequestController } from './child-ride-request.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ChildRideRequestService],
  controllers: [ChildRideRequestController],
})
export class ChildRideRequestModule {}
