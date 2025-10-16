import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChildRideRequestService {
  constructor(private prisma: PrismaService) {}

  async getRequestsForDriver(driverId: number) {
    // Fetch ChildRideRequests for the driver, include child details
    return this.prisma.childRideRequest.findMany({
      where: { driverId },
      include: {
        child: {
          select: {
            childFirstName: true,
            childLastName: true,
            nearbyCity: true,
            child_id: true,
          },
        },
      },
    });
  }
}
