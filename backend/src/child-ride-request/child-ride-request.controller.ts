import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ChildRideRequestService } from './child-ride-request.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UserType } from '@prisma/client';

// Authenticated Request interface to match JWT payload
interface AuthenticatedRequest extends Request {
  user: {
    sub: string; // driver_id from JWT token
    phone: string;
    userType: UserType;
    isVerified: boolean;
  };
}

@Controller('driver/child-ride-requests')
export class ChildRideRequestController {
  constructor(private readonly service: ChildRideRequestService) {}

  // Get child ride requests for authenticated driver
  @UseGuards(JwtAuthGuard)
  @Get()
  async getChildRideRequestsForDriver(@Req() req: AuthenticatedRequest) {
    const driverId = parseInt(req.user.sub, 10); // Get driver ID from JWT token
    return this.service.getRequestsForDriver(driverId);
  }
}
