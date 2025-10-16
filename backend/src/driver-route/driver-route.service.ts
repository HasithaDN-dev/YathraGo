import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleService } from './google.service';

@Injectable()
export class DriverRouteService {
  private readonly logger = new Logger(DriverRouteService.name);
  constructor(
    private prisma: PrismaService,
    private google: GoogleService,
  ) {}

  async buildAndSaveOptimizedRoute(driverId: number) {
    // 1. fetch assigned children (accepted/assigned requests)
    const requests = await this.prisma.childRideRequest.findMany({
      where: { driverId, status: 'Assigned' },
      include: {
        child: {
          select: {
            child_id: true,
            childFirstName: true,
            childLastName: true,
            pickupLatitude: true,
            pickupLongitude: true,
            schoolLatitude: true,
            schoolLongitude: true,
          },
        },
      },
    });

    if (!requests || requests.length === 0) {
      return { message: 'No assigned children found' };
    }

    // prepare waypoints as strings "lat,lng" for Google API
    const waypoints: string[] = [];
    // mapping from waypoint index to childId so we can persist exact mapping
    const waypointToChildId: Record<number, number> = {};
    let wpIndex = 0;
    requests.forEach((r) => {
      const c = r.child;
      // pickup
      if (c.pickupLatitude != null && c.pickupLongitude != null) {
        waypoints.push(`${c.pickupLatitude},${c.pickupLongitude}`);
        waypointToChildId[wpIndex] = c.child_id;
        wpIndex++;
      }
      // dropoff (school)
      if (c.schoolLatitude != null && c.schoolLongitude != null) {
        waypoints.push(`${c.schoolLatitude},${c.schoolLongitude}`);
        waypointToChildId[wpIndex] = c.child_id;
        wpIndex++;
      }
    });

    // call google directions api with optimize:true
    const directions = await this.google.getOptimizedDirections(waypoints);
    if (!directions) throw new Error('Google Directions API failed');

    // store DriverRoute
    const driverRoute = await this.prisma.driverRoute.create({
      data: {
        driverId,
        date: new Date(),
        routeDetails: directions,
      },
    });

    // create route waypoints with order using waypoint_order if available
    const order: number[] = directions.routes?.[0]?.waypoint_order ?? [];
    // waypoint_order refers to the indices of the supplied waypoints array
    const total = order.length ? order.length : waypoints.length;
    for (let i = 0; i < total; i++) {
      const mappedIndex = order.length ? order[i] : i;
      const childId =
        waypointToChildId[mappedIndex] ?? requests[0].child.child_id;

      await this.prisma.routeWaypoint.create({
        data: {
          driverRouteId: driverRoute.id,
          childId,
          driverId,
          order: i,
        },
      });
    }

    return driverRoute;
  }

  async getLatestRouteForDriver(driverId: number) {
    const route = await this.prisma.driverRoute.findFirst({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
    });
    return route;
  }
}
