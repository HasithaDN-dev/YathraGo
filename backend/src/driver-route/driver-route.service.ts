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

    // prepare waypoints for Google API and metadata mapping
    const waypointCoords: Array<{
      lat: number;
      lng: number;
      type: 'PICKUP' | 'DROPOFF';
      childId: number;
    }> = [];
    requests.forEach((r) => {
      const c = r.child;
      if (c.pickupLatitude != null && c.pickupLongitude != null) {
        waypointCoords.push({
          lat: c.pickupLatitude,
          lng: c.pickupLongitude,
          type: 'PICKUP',
          childId: c.child_id,
        });
      }
      if (c.schoolLatitude != null && c.schoolLongitude != null) {
        waypointCoords.push({
          lat: c.schoolLatitude,
          lng: c.schoolLongitude,
          type: 'DROPOFF',
          childId: c.child_id,
        });
      }
    });
    const waypoints: string[] = waypointCoords.map((w) => `${w.lat},${w.lng}`);

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
    const route = directions.routes?.[0];
    const order: number[] = route?.waypoint_order ?? [];
    const legs = route?.legs ?? [];
    // If Google reorders, follow that; else use the original order
    const finalOrder = order.length
      ? order
      : waypointCoords.map((_, idx) => idx);
    let cumulativeDistance = 0;
    for (let i = 0; i < finalOrder.length; i++) {
      const mappedIndex = finalOrder[i];
      const wp = waypointCoords[mappedIndex];
      const leg = legs[i];
      if (leg?.distance?.value != null)
        cumulativeDistance += leg.distance.value;
      await this.prisma.routeWaypoint.create({
        data: {
          driverRouteId: driverRoute.id,
          childId: wp.childId,
          driverId,
          order: i,
          type: wp.type as any,
          latitude: wp.lat,
          longitude: wp.lng,
          address: leg?.end_address ?? undefined,
          eta: leg?.arrival_time
            ? new Date(leg.arrival_time.value * 1000)
            : undefined,
          cumulativeDistanceMeters: cumulativeDistance,
        },
      });
    }

    return driverRoute;
  }

  async getLatestRouteForDriver(driverId: number) {
    const route = await this.prisma.driverRoute.findFirst({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
      include: {
        waypoints: {
          orderBy: { order: 'asc' },
          include: {
            child: {
              select: {
                child_id: true,
                childFirstName: true,
                childLastName: true,
                pickUpAddress: true,
                school: true,
                pickupLatitude: true,
                pickupLongitude: true,
                schoolLatitude: true,
                schoolLongitude: true,
              },
            },
          },
        },
      },
    });
    return route;
  }

  async getTodayRouteForDriver(driverId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const route = await this.prisma.driverRoute.findFirst({
      where: {
        driverId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        waypoints: {
          orderBy: { order: 'asc' },
          include: {
            child: {
              select: {
                child_id: true,
                childFirstName: true,
                childLastName: true,
                pickUpAddress: true,
                school: true,
                pickupLatitude: true,
                pickupLongitude: true,
                schoolLatitude: true,
                schoolLongitude: true,
              },
            },
            attendance: {
              where: {
                status: 'completed',
              },
              select: {
                id: true,
                type: true,
                timestamp: true,
              },
            },
          },
        },
      },
    });

    if (!route) {
      return null;
    }

    // Transform the data for frontend consumption
    const waypoints = route.waypoints.map((waypoint) => ({
      waypointId: waypoint.id,
      order: waypoint.order,
      type: waypoint.type,
      childId: waypoint.childId,
      childName: `${waypoint.child.childFirstName} ${waypoint.child.childLastName}`,
      pickupAddress: waypoint.child.pickUpAddress,
      school: waypoint.child.school,
      lat:
        waypoint.latitude ||
        (waypoint.type === 'PICKUP'
          ? waypoint.child.pickupLatitude
          : waypoint.child.schoolLatitude),
      lng:
        waypoint.longitude ||
        (waypoint.type === 'PICKUP'
          ? waypoint.child.pickupLongitude
          : waypoint.child.schoolLongitude),
      address: waypoint.address,
      eta: waypoint.eta,
      distance: waypoint.cumulativeDistanceMeters,
      isCompleted: waypoint.attendance.length > 0,
    }));

    return {
      routeId: route.id,
      driverId: route.driverId,
      date: route.date,
      waypoints,
      totalStops: waypoints.length,
      completedStops: waypoints.filter((w) => w.isCompleted).length,
    };
  }
}
