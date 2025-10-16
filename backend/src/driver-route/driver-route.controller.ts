import { Controller, Post, Param, Get, ParseIntPipe } from '@nestjs/common';
import { DriverRouteService } from './driver-route.service';

@Controller('driver-route')
export class DriverRouteController {
  constructor(private readonly service: DriverRouteService) {}

  @Post('optimize/:driverId')
  async optimize(@Param('driverId', ParseIntPipe) driverId: number) {
    return this.service.buildAndSaveOptimizedRoute(driverId);
  }

  @Get(':driverId')
  async getLatest(@Param('driverId', ParseIntPipe) driverId: number) {
    return this.service.getLatestRouteForDriver(driverId);
  }
}
