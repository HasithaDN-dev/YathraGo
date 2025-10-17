import { Controller, Post, Param, Get, ParseIntPipe } from '@nestjs/common';
import { DriverRouteService } from './driver-route.service';
import { Prisma } from '@prisma/client';

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

  @Get('today/:driverId')
  async getTodayRoute(@Param('driverId', ParseIntPipe) driverId: number) {
    const route = await this.service.getTodayRouteForDriver(driverId);
    if (!route) {
      return {
        success: false,
        message: 'No route found for today',
        data: null,
      };
    }
    return {
      success: true,
      data: route,
    };
  }

  // optional: return a simplified ordered stops array with polyline for quick rendering
  @Get(':driverId/summary')
  async getLatestSummary(@Param('driverId', ParseIntPipe) driverId: number) {
    const route = await this.service.getLatestRouteForDriver(driverId);
    const details: Prisma.JsonValue | any = route?.routeDetails as any;
    const overview = details?.routes?.[0]?.overview_polyline?.points ?? null;
    const legs = details?.routes?.[0]?.legs ?? [];
    return {
      id: route?.id,
      date: route?.date,
      overviewPolyline: overview,
      legs,
      waypoints: route?.waypoints ?? [],
    };
  }
}
