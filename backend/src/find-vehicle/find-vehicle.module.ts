import { Module } from '@nestjs/common';
import { FindVehicleController } from './find-vehicle.controller';
import { FindVehicleService } from './find-vehicle.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FindVehicleController],
  providers: [FindVehicleService],
  exports: [FindVehicleService],
})
export class FindVehicleModule {}
