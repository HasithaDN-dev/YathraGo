// src/driver-route/driver-route.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { DriverRouteService } from './driver-route.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UserType } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    phone: string;
    userType: UserType;
    isVerified: boolean;
  };
}

@Controller('driver/route')
@UseGuards(JwtAuthGuard)
export class DriverRouteController {
  constructor(private driverRouteService: DriverRouteService) {}

  /**
   * Get today's optimized route for the driver
   * This is called when the driver clicks "Start Trip"
   */
  @Post('today')
  @HttpCode(HttpStatus.OK)
  async getTodaysRoute(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      routeType?: 'MORNING_PICKUP' | 'AFTERNOON_DROPOFF';
      latitude?: number;
      longitude?: number;
    },
  ) {
    const driverId = parseInt(req.user.sub, 10);
    const routeType = body.routeType || 'MORNING_PICKUP';

    return this.driverRouteService.getTodaysRoute(
      driverId,
      routeType,
      body.latitude,
      body.longitude,
    );
  }

  /**
   * Mark a stop as completed (pickup or dropoff done)
   */
  @Patch('stop/:stopId/complete')
  @HttpCode(HttpStatus.OK)
  async markStopCompleted(
    @Req() req: AuthenticatedRequest,
    @Param('stopId', ParseIntPipe) stopId: number,
    @Body()
    body: {
      latitude?: number;
      longitude?: number;
      notes?: string;
    },
  ) {
    const driverId = parseInt(req.user.sub, 10);

    return this.driverRouteService.markStopCompleted(
      stopId,
      driverId,
      body.latitude,
      body.longitude,
      body.notes,
    );
  }

  /**
   * Get current route status
   */
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getCurrentRouteStatus(@Req() req: AuthenticatedRequest) {
    const driverId = parseInt(req.user.sub, 10);
    return this.driverRouteService.getCurrentRouteStatus(driverId);
  }
}
