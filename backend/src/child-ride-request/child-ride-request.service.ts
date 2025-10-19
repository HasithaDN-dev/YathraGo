import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RideRequestPassengerDto } from './dto/ride-request-passenger.dto';

@Injectable()
export class ChildRideRequestService {
  constructor(private prisma: PrismaService) {}

  async getRequestsForDriver(
    driverId: number,
  ): Promise<RideRequestPassengerDto[]> {
    // Get today's date (start and end of day for comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch ChildRideRequests for the driver with status 'Assigned' and include full child + customer
    const assignedRequests = await this.prisma.childRideRequest.findMany({
      where: {
        driverId,
        status: 'Assigned',
      },
      include: {
        child: {
          include: {
            Customer: true,
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
    const presentRequests = assignedRequests.filter(
      (request) => !absentChildIds.has(request.child.child_id),
    );

    // Map to DTO combining ChildRideRequest + Child + optional Customer
    const result: RideRequestPassengerDto[] = presentRequests.map((r) => ({
      rideRequestId: r.id,
      childId: r.childId,
      driverId: r.driverId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      Amount: r.Amount ?? null,
      AssignedDate: r.AssignedDate ?? null,
      Estimation: r.Estimation ?? null,
      status: r.status,
      child: {
        child_id: r.child.child_id,
        relationship: r.child.relationship,
        nearbyCity: r.child.nearbyCity,
        schoolLocation: r.child.schoolLocation,
        school: r.child.school,
        childFirstName: r.child.childFirstName,
        childLastName: r.child.childLastName,
        gender: r.child.gender,
        childImageUrl: r.child.childImageUrl,
        pickUpAddress: r.child.pickUpAddress,
        schoolLatitude: r.child.schoolLatitude,
        schoolLongitude: r.child.schoolLongitude,
        pickupLatitude: r.child.pickupLatitude,
        pickupLongitude: r.child.pickupLongitude,
        customerId: r.child.customerId,
      },
      customer: r.child.Customer
        ? {
            customer_id: r.child.Customer.customer_id,
            firstName: r.child.Customer.firstName,
            lastName: r.child.Customer.lastName,
            phone: r.child.Customer.phone,
            email: r.child.Customer.email,
            profileImageUrl: r.child.Customer.profileImageUrl,
          }
        : undefined,
    }));

    return result;
  }
}
