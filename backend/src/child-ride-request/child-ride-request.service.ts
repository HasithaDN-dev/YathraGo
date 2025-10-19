import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChildRideRequestService {
  constructor(private prisma: PrismaService) {}

  async getRequestsForDriver(driverId: number) {
    // Get today's date (start and end of day for comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch ChildRideRequests for the driver with status 'Assigned'
    const assignedRequests = await this.prisma.childRideRequest.findMany({
      where: {
        driverId,
        status: 'Assigned',
      },
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

    // Get list of absent children for today
    const absentChildren = await this.prisma.absence_Child.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        childId: true,
      },
    });

    // Create a Set of absent child IDs for quick lookup
    const absentChildIds = new Set(
      absentChildren.map((absence) => absence.childId),
    );

    // Filter out absent children from assigned requests
    const presentChildren = assignedRequests.filter(
      (request) => !absentChildIds.has(request.child.child_id),
    );

    return presentChildren;
  }
}
