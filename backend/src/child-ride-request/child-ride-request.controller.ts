import { Controller, Get } from '@nestjs/common';
import { ChildRideRequestService } from './child-ride-request.service';

@Controller('driver/child-ride-requests')
export class ChildRideRequestController {
  constructor(private readonly service: ChildRideRequestService) {}

  // For demo, use hardcoded driverId = 1
  @Get()
  async getChildRideRequestsForDriver() {
    const driverId = 1;
    return this.service.getRequestsForDriver(driverId);
  }
}
