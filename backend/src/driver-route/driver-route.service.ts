// src/driver-route/driver-route.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VRPOptimizerService } from './vrp-optimizer.service';
import axios from 'axios';

interface ChildLocation {
  childId: number;
  childName: string;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  pickupAddress: string;
  schoolLatitude: number | null;
  schoolLongitude: number | null;
  schoolAddress: string;
}

interface Stop {
  childId: number;
  childName: string;
  type: 'PICKUP' | 'DROPOFF';
  latitude: number;
  longitude: number;
  address: string;
}

interface OptimizedStop extends Stop {
  order: number;
  etaSecs: number;
  cumulativeDistanceMeters: number;
  legDistanceMeters: number;
}

interface RouteOptimizationResult {
  stops: OptimizedStop[];
  totalDistanceMeters: number;
  totalDurationSecs: number;
  polyline: string | null;
}

@Injectable()
export class DriverRouteService {
  constructor(
    private prisma: PrismaService,
    private vrpOptimizer: VRPOptimizerService,
  ) {}

  /**
   * Get today's route for the driver
   * This is the main endpoint the driver app calls when starting a ride
   */
  async getTodaysRoute(
    driverId: number,
    routeType: 'MORNING_PICKUP' | 'AFTERNOON_DROPOFF' = 'MORNING_PICKUP',
    driverLatitude?: number,
    driverLongitude?: number,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Step 1: Check if route already exists for today
    const existingRoute = await this.prisma.driverRoute.findUnique({
      where: {
        driverId_date_routeType: {
          driverId,
          date: today,
          routeType,
        },
      },
      include: {
        stops: {
          orderBy: { order: 'asc' },
          include: {
            child: {
              select: {
                child_id: true,
                childFirstName: true,
                childLastName: true,
                childImageUrl: true,
              },
            },
          },
        },
      },
    });

    // If route exists and is not completed, return it
    if (existingRoute && existingRoute.status !== 'COMPLETED') {
      return {
        success: true,
        route: existingRoute,
        stops: existingRoute.stops.map((stop) => ({
          stopId: stop.id,
          childId: stop.childId,
          childName: `${stop.child.childFirstName} ${stop.child.childLastName}`,
          childImage: stop.child.childImageUrl,
          type: stop.type,
          address: stop.address,
          latitude: stop.latitude,
          longitude: stop.longitude,
          etaSecs: stop.etaSecs,
          legDistanceMeters: stop.legDistanceMeters,
          cumulativeDistanceMeters: stop.cumulativeDistanceMeters,
          status: stop.status,
          order: stop.order,
        })),
      };
    }

    // Step 2: Get all assigned children for this driver
    const assignedChildren = await this.getAssignedChildren(driverId);

    if (assignedChildren.length === 0) {
      throw new BadRequestException(
        'No students assigned to this driver. Please check ride requests.',
      );
    }

    // Step 3: Filter by attendance (get present students only)
    const presentChildren = await this.filterByAttendance(
      assignedChildren,
      today,
    );

    if (presentChildren.length === 0) {
      throw new BadRequestException(
        'No students are present today or all students are marked absent.',
      );
    }

    // Step 4: Generate stops based on route type
    const stops = this.generateStops(presentChildren, routeType);

    if (stops.length === 0) {
      throw new BadRequestException(
        'Unable to generate route stops. Please check student location data.',
      );
    }

    // Step 5: Optimize the route order using VRP with pickup-delivery constraints
    const optimizedRoute = await this.optimizeRouteWithVRP(
      driverId,
      routeType,
      driverLatitude,
      driverLongitude,
    );

    // Step 6: Save the route to database
    const savedRoute = await this.saveRouteToDatabase(
      driverId,
      today,
      routeType,
      optimizedRoute,
    );

    return {
      success: true,
      route: savedRoute,
      stops: savedRoute?.stops?.map((stop) => ({
        stopId: stop.id,
        childId: stop.childId,
        childName: `${stop.child.childFirstName} ${stop.child.childLastName}`,
        childImage: stop.child.childImageUrl,
        type: stop.type,
        address: stop.address,
        latitude: stop.latitude,
        longitude: stop.longitude,
        etaSecs: stop.etaSecs,
        legDistanceMeters: stop.legDistanceMeters,
        cumulativeDistanceMeters: stop.cumulativeDistanceMeters,
        status: stop.status,
        order: stop.order,
      })),
    };
  }

  /**
   * Get all children assigned to this driver with confirmed ride requests
   */
  private async getAssignedChildren(
    driverId: number,
  ): Promise<ChildLocation[]> {
    const rideRequests = await this.prisma.childRideRequest.findMany({
      where: {
        driverId,
        status: 'Assigned',
      },
      include: {
        child: {
          select: {
            child_id: true,
            childFirstName: true,
            childLastName: true,
            pickupLatitude: true,
            pickupLongitude: true,
            pickUpAddress: true,
            schoolLatitude: true,
            schoolLongitude: true,
            school: true,
          },
        },
      },
    });

    return rideRequests.map((req) => ({
      childId: req.child.child_id,
      childName: `${req.child.childFirstName} ${req.child.childLastName}`,
      pickupLatitude: req.child.pickupLatitude,
      pickupLongitude: req.child.pickupLongitude,
      pickupAddress: req.child.pickUpAddress,
      schoolLatitude: req.child.schoolLatitude,
      schoolLongitude: req.child.schoolLongitude,
      schoolAddress: req.child.school,
    }));
  }

  /**
   * Filter children by today's attendance (check for absences)
   */
  private async filterByAttendance(
    children: ChildLocation[],
    date: Date,
  ): Promise<ChildLocation[]> {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all absent children for today
    const absences = await this.prisma.absence_Child.findMany({
      where: {
        childId: { in: children.map((c) => c.childId) },
        date: {
          gte: date,
          lt: tomorrow,
        },
      },
      select: { childId: true },
    });

    const absentChildIds = new Set(absences.map((a) => a.childId));

    // Return only present children (those not in absence list)
    return children.filter((child) => !absentChildIds.has(child.childId));
  }

  /**
   * Generate stops based on route type and present children
   */
  private generateStops(
    children: ChildLocation[],
    routeType: 'MORNING_PICKUP' | 'AFTERNOON_DROPOFF',
  ): Stop[] {
    const stops: Stop[] = [];

    if (routeType === 'MORNING_PICKUP') {
      // Morning: Pick up each child from home, then drop off at school
      for (const child of children) {
        // Add pickup stop
        if (child.pickupLatitude != null && child.pickupLongitude != null) {
          stops.push({
            childId: child.childId,
            childName: child.childName,
            type: 'PICKUP',
            latitude: child.pickupLatitude,
            longitude: child.pickupLongitude,
            address: child.pickupAddress,
          });
        }
      }

      // Add dropoff stops. Use each child's school coordinates (preserve per-child school info)
      for (const child of children) {
        if (
          child.schoolLatitude != null &&
          child.schoolLongitude != null
        ) {
          stops.push({
            childId: child.childId,
            childName: child.childName,
            type: 'DROPOFF',
            latitude: child.schoolLatitude,
            longitude: child.schoolLongitude,
            address: child.schoolAddress,
          });
        }
      }
    } else {
      // Afternoon: Pick up from school, then drop off at each home
      const firstChild = children[0];
      if (
        firstChild &&
        firstChild.schoolLatitude != null &&
        firstChild.schoolLongitude != null
      ) {
        // Add school pickup (common starting point)
        for (const child of children) {
          stops.push({
            childId: child.childId,
            childName: child.childName,
            type: 'PICKUP',
            latitude: firstChild.schoolLatitude,
            longitude: firstChild.schoolLongitude,
            address: firstChild.schoolAddress,
          });
        }
      }

      // Add home dropoffs
      for (const child of children) {
        if (child.pickupLatitude != null && child.pickupLongitude != null) {
          stops.push({
            childId: child.childId,
            childName: child.childName,
            type: 'DROPOFF',
            latitude: child.pickupLatitude,
            longitude: child.pickupLongitude,
            address: child.pickupAddress,
          });
        }
      }
    }

    return stops;
  }

  /**
   * Optimize route using VRP with pickup-delivery constraints
   */
  private async optimizeRouteWithVRP(
    driverId: number,
    routeType: 'MORNING_PICKUP' | 'AFTERNOON_DROPOFF',
    driverLatitude?: number,
    driverLongitude?: number,
  ): Promise<RouteOptimizationResult> {
    try {
      let vrpResult;
      
      if (routeType === 'MORNING_PICKUP') {
        vrpResult = await this.vrpOptimizer.optimizeMorningRoute(
          driverId,
          driverLatitude,
          driverLongitude,
        );
      } else {
        vrpResult = await this.vrpOptimizer.optimizeEveningRoute(
          driverId,
          driverLatitude,
          driverLongitude,
        );
      }

      // Convert VRP result to RouteOptimizationResult format
      const optimizedStops: OptimizedStop[] = vrpResult.orderedStops.map((stop, index) => ({
        childId: stop.childId,
        childName: '', // Will be filled from database
        type: stop.type,
        latitude: stop.lat,
        longitude: stop.lng,
        address: stop.address,
        order: index,
        etaSecs: stop.eta,
        cumulativeDistanceMeters: vrpResult.legs[index]?.distance?.value || 0,
        legDistanceMeters: vrpResult.legs[index]?.distance?.value || 0,
      }));

      console.log(`VRP Result polyline: ${vrpResult.polyline?.substring(0, 50)}...`);

      return {
        stops: optimizedStops,
        totalDistanceMeters: vrpResult.diagnostics.totalDistance,
        totalDurationSecs: vrpResult.diagnostics.totalTime,
        polyline: vrpResult.polyline,
      };
    } catch (error) {
      console.error('VRP optimization failed, falling back to legacy method:', error);
      // Fallback to legacy optimization
      const assignedChildren = await this.getAssignedChildren(driverId);
      const presentChildren = await this.filterByAttendance(assignedChildren, new Date());
      const stops = this.generateStops(presentChildren, routeType);
      return this.optimizeRoute(stops, driverLatitude, driverLongitude);
    }
  }

  /**
   * Legacy optimize route order using Google Maps Distance Matrix and Directions API
   */
  private async optimizeRoute(
    stops: Stop[],
    driverLatitude?: number,
    driverLongitude?: number,
  ): Promise<RouteOptimizationResult> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      // Fallback: return stops in default order without optimization
      console.warn('Google Maps API key not configured, using default order');
      return this.createFallbackRoute(stops);
    }

    try {
      // Build origins and destinations for distance matrix
      const origins: string[] = [];
      const destinations: string[] = [];

      // Add driver location as first origin if provided
      if (driverLatitude != null && driverLongitude != null) {
        origins.push(`${driverLatitude},${driverLongitude}`);
      }

      // Add all stops as origins and destinations
      for (const stop of stops) {
        const location = `${stop.latitude},${stop.longitude}`;
        origins.push(location);
        destinations.push(location);
      }

      // Fetch distance matrix
      const matrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json`;
      const matrixParams = new URLSearchParams({
        origins: origins.join('|'),
        destinations: destinations.join('|'),
        key: apiKey,
      });

      const matrixResponse = await axios.get(
        `${matrixUrl}?${matrixParams.toString()}`,
        { timeout: 15000 },
      );

      if (matrixResponse.data?.status !== 'OK') {
        console.error(
          'Distance Matrix API error:',
          matrixResponse.data?.status,
        );
        return this.createFallbackRoute(stops);
      }

      // Parse distance matrix
      const matrix = this.parseDistanceMatrix(matrixResponse.data);

      // Apply greedy optimization algorithm with pickup/dropoff constraints
      const orderedStops = this.applyGreedyOptimization(
        stops,
        matrix,
        driverLatitude != null && driverLongitude != null,
      );

      // Calculate cumulative times and distances
      const optimizedStops = this.calculateCumulativeMetrics(
        orderedStops,
        matrix,
        driverLatitude != null && driverLongitude != null,
      );

      // Fetch polyline from Directions API
      const polyline = await this.fetchDirectionsPolyline(
        optimizedStops,
        driverLatitude,
        driverLongitude,
        apiKey,
      );

      return {
        stops: optimizedStops,
        totalDistanceMeters: optimizedStops.reduce(
          (sum, s) => sum + s.legDistanceMeters,
          0,
        ),
        totalDurationSecs:
          optimizedStops.length > 0
            ? optimizedStops[optimizedStops.length - 1].etaSecs -
              Math.floor(Date.now() / 1000)
            : 0,
        polyline,
      };
    } catch (error) {
      console.error('Error optimizing route:', error);
      return this.createFallbackRoute(stops);
    }
  }

  /**
   * Parse Google Maps Distance Matrix response
   */
  private parseDistanceMatrix(data: any): {
    distances: number[][];
    durations: number[][];
  } {
    const rows = data.rows || [];
    const distances: number[][] = [];
    const durations: number[][] = [];

    for (const row of rows) {
      const distRow: number[] = [];
      const durRow: number[] = [];

      for (const element of row.elements || []) {
        distRow.push(element?.distance?.value ?? 0);
        durRow.push(element?.duration?.value ?? 0);
      }

      distances.push(distRow);
      durations.push(durRow);
    }

    return { distances, durations };
  }

  /**
   * Apply greedy nearest-neighbor optimization with pickup-before-dropoff constraint
   */
  private applyGreedyOptimization(
    stops: Stop[],
    matrix: { distances: number[][]; durations: number[][] },
    hasDriverLocation: boolean,
  ): Stop[] {
    const ordered: Stop[] = [];
    const remaining = [...stops];
    const pickedUpChildren = new Set<number>();

    // Start from driver location (index 0) or first stop
    let currentIndex = hasDriverLocation ? 0 : 1;

    while (remaining.length > 0) {
      let bestStop: Stop | null = null;
      let bestIndex = -1;
      let bestDistance = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const stop = remaining[i];

        // Constraint: Can only do dropoff if child has been picked up
        if (stop.type === 'DROPOFF' && !pickedUpChildren.has(stop.childId)) {
          continue;
        }

        // Get distance from current location to this stop
        const stopIndex = stops.indexOf(stop);
        const distanceMatrixIndex = hasDriverLocation
          ? stopIndex + 1
          : stopIndex;
        const distance =
          matrix.distances[currentIndex]?.[distanceMatrixIndex] ?? Infinity;

        if (distance < bestDistance) {
          bestDistance = distance;
          bestStop = stop;
          bestIndex = i;
        }
      }

      if (bestStop) {
        ordered.push(bestStop);
        remaining.splice(bestIndex, 1);

        // Mark child as picked up
        if (bestStop.type === 'PICKUP') {
          pickedUpChildren.add(bestStop.childId);
        }

        // Update current index for next iteration
        const stopIndex = stops.indexOf(bestStop);
        currentIndex = hasDriverLocation ? stopIndex + 1 : stopIndex;
      } else {
        // If no valid stop found, just take the first remaining one
        if (remaining.length > 0) {
          ordered.push(remaining[0]);
          remaining.splice(0, 1);
        }
      }
    }

    return ordered;
  }

  /**
   * Calculate cumulative ETAs and distances for ordered stops
   */
  private calculateCumulativeMetrics(
    orderedStops: Stop[],
    matrix: { distances: number[][]; durations: number[][] },
    hasDriverLocation: boolean,
  ): OptimizedStop[] {
    const now = Math.floor(Date.now() / 1000);
    let cumulativeTime = 0;
    let cumulativeDistance = 0;
    let previousIndex = hasDriverLocation ? 0 : 1;

    const result: OptimizedStop[] = [];

    for (let i = 0; i < orderedStops.length; i++) {
      const stop = orderedStops[i];

      // Find this stop's index in the original matrix
      // Note: We need to map back to the matrix indices
      const stopMatrixIndex = hasDriverLocation ? i + 1 : i;

      const legDuration =
        matrix.durations[previousIndex]?.[stopMatrixIndex] ?? 0;
      const legDistance =
        matrix.distances[previousIndex]?.[stopMatrixIndex] ?? 0;

      cumulativeTime += legDuration;
      cumulativeDistance += legDistance;

      result.push({
        ...stop,
        order: i,
        etaSecs: now + cumulativeTime,
        cumulativeDistanceMeters: cumulativeDistance,
        legDistanceMeters: legDistance,
      });

      previousIndex = stopMatrixIndex;
    }

    return result;
  }

  /**
   * Fetch polyline from Google Directions API
   */
  private async fetchDirectionsPolyline(
    stops: OptimizedStop[],
    driverLatitude?: number,
    driverLongitude?: number,
    apiKey?: string,
  ): Promise<string | null> {
    if (!apiKey || stops.length === 0) return null;

    try {
      const origin =
        driverLatitude != null && driverLongitude != null
          ? `${driverLatitude},${driverLongitude}`
          : `${stops[0].latitude},${stops[0].longitude}`;

      const destination = `${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`;

      const waypoints = stops
        .slice(0, -1)
        .map((s) => `${s.latitude},${s.longitude}`)
        .join('|');

      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json`;
      const params = new URLSearchParams({
        origin,
        destination,
        ...(waypoints && { waypoints }),
        key: apiKey,
      });

      const response = await axios.get(
        `${directionsUrl}?${params.toString()}`,
        {
          timeout: 15000,
        },
      );

      if (response.data?.routes?.[0]?.overview_polyline?.points) {
        return response.data.routes[0].overview_polyline.points;
      }

      return null;
    } catch (error) {
      console.error('Error fetching directions polyline:', error);
      return null;
    }
  }

  /**
   * Create fallback route without optimization
   */
  private createFallbackRoute(stops: Stop[]): RouteOptimizationResult {
    const now = Math.floor(Date.now() / 1000);
    const estimatedTimePerStop = 300; // 5 minutes per stop

    const optimizedStops: OptimizedStop[] = stops.map((stop, index) => ({
      ...stop,
      order: index,
      etaSecs: now + estimatedTimePerStop * (index + 1),
      cumulativeDistanceMeters: 1000 * (index + 1), // Estimate 1km per stop
      legDistanceMeters: 1000,
    }));

    return {
      stops: optimizedStops,
      totalDistanceMeters: stops.length * 1000,
      totalDurationSecs: stops.length * estimatedTimePerStop,
      polyline: null,
    };
  }

  /**
   * Save optimized route to database
   */
  private async saveRouteToDatabase(
    driverId: number,
    date: Date,
    routeType: 'MORNING_PICKUP' | 'AFTERNOON_DROPOFF',
    optimizedRoute: RouteOptimizationResult,
  ) {
    // Create or update the driver route
    const driverRoute = await this.prisma.driverRoute.upsert({
      where: {
        driverId_date_routeType: {
          driverId,
          date,
          routeType,
        },
      },
      create: {
        driverId,
        date,
        routeType,
        status: 'PENDING',
        totalDistanceMeters: optimizedRoute.totalDistanceMeters,
        totalDurationSecs: optimizedRoute.totalDurationSecs,
        optimizedPolyline: optimizedRoute.polyline,
      },
      update: {
        totalDistanceMeters: optimizedRoute.totalDistanceMeters,
        totalDurationSecs: optimizedRoute.totalDurationSecs,
        optimizedPolyline: optimizedRoute.polyline,
        status: 'PENDING',
      },
    });

    // Delete existing stops
    await this.prisma.routeStop.deleteMany({
      where: { driverRouteId: driverRoute.id },
    });

    // Create new stops
    await this.prisma.routeStop.createMany({
      data: optimizedRoute.stops.map((stop) => ({
        driverRouteId: driverRoute.id,
        childId: stop.childId,
        order: stop.order,
        type: stop.type,
        address: stop.address,
        latitude: stop.latitude,
        longitude: stop.longitude,
        etaSecs: stop.etaSecs,
        cumulativeDistanceMeters: stop.cumulativeDistanceMeters,
        legDistanceMeters: stop.legDistanceMeters,
        status: 'PENDING',
      })),
    });

    // Fetch and return complete route with stops
    return this.prisma.driverRoute.findUnique({
      where: { id: driverRoute.id },
      include: {
        stops: {
          orderBy: { order: 'asc' },
          include: {
            child: {
              select: {
                child_id: true,
                childFirstName: true,
                childLastName: true,
                childImageUrl: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Mark a stop as completed
   */
  async markStopCompleted(
    stopId: number,
    driverId: number,
    latitude?: number,
    longitude?: number,
    notes?: string,
  ) {
    // Fetch the stop
    const stop = await this.prisma.routeStop.findUnique({
      where: { id: stopId },
      include: {
        driverRoute: true,
        child: true,
      },
    });

    if (!stop) {
      throw new NotFoundException(`Stop with ID ${stopId} not found`);
    }

    // Verify the stop belongs to this driver
    if (stop.driverRoute.driverId !== driverId) {
      throw new BadRequestException('This stop does not belong to you');
    }

    // Update stop status
    const updatedStop = await this.prisma.routeStop.update({
      where: { id: stopId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Create attendance record
    // Determine session-aware attendance type based on route type and stop type
    let attendanceType:
      | 'MORNING_PICKUP'
      | 'MORNING_DROPOFF'
      | 'EVENING_PICKUP'
      | 'EVENING_DROPOFF';
    if (stop.driverRoute.routeType === 'MORNING_PICKUP') {
      attendanceType =
        stop.type === 'PICKUP' ? 'MORNING_PICKUP' : 'MORNING_DROPOFF';
    } else if (stop.driverRoute.routeType === 'AFTERNOON_DROPOFF') {
      attendanceType =
        stop.type === 'PICKUP' ? 'EVENING_PICKUP' : 'EVENING_DROPOFF';
    } else {
      // Fallback for any other route types - default to morning pickup
      attendanceType = 'MORNING_PICKUP';
    }

    await this.prisma.attendance.create({
      data: {
        driverId,
        childId: stop.childId,
        date: stop.driverRoute.date,
        type: attendanceType,
        latitude,
        longitude,
        notes: notes || `${stop.type} completed`,
        status: 'completed',
      },
    });

    // Check if all stops are completed
    const remainingStops = await this.prisma.routeStop.count({
      where: {
        driverRouteId: stop.driverRouteId,
        status: { not: 'COMPLETED' },
      },
    });

    // If all stops completed, mark route as completed
    if (remainingStops === 0) {
      await this.prisma.driverRoute.update({
        where: { id: stop.driverRouteId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    } else {
      // Update route status to IN_PROGRESS if not already
      await this.prisma.driverRoute.update({
        where: { id: stop.driverRouteId },
        data: {
          status: 'IN_PROGRESS',
          startedAt: stop.driverRoute.startedAt || new Date(),
        },
      });
    }

    return {
      success: true,
      stop: updatedStop,
      remainingStops,
      routeCompleted: remainingStops === 0,
    };
  }

  /**
   * Get current route status
   */
  async getCurrentRouteStatus(driverId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const routes = await this.prisma.driverRoute.findMany({
      where: {
        driverId,
        date: today,
      },
      include: {
        stops: {
          orderBy: { order: 'asc' },
          include: {
            child: {
              select: {
                child_id: true,
                childFirstName: true,
                childLastName: true,
                childImageUrl: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      routes,
    };
  }

  /**
   * Check session availability for morning and evening routes
   * Returns whether morning and evening sessions can be started
   */
  async getSessionAvailability(driverId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check morning route status
    const morningRoute = await this.prisma.driverRoute.findUnique({
      where: {
        driverId_date_routeType: {
          driverId,
          date: today,
          routeType: 'MORNING_PICKUP',
        },
      },
    });

    // Check evening route status
    const eveningRoute = await this.prisma.driverRoute.findUnique({
      where: {
        driverId_date_routeType: {
          driverId,
          date: today,
          routeType: 'AFTERNOON_DROPOFF',
        },
      },
    });

    const morningCompleted = morningRoute?.status === 'COMPLETED';
    const eveningCompleted = eveningRoute?.status === 'COMPLETED';

    return {
      success: true,
      morningSession: {
        available: true, // Morning always available
        status: morningRoute?.status || 'NOT_STARTED',
        completed: morningCompleted,
      },
      eveningSession: {
        available: morningCompleted, // Evening only available after morning completion
        status: eveningRoute?.status || 'NOT_STARTED',
        completed: eveningCompleted,
      },
    };
  }
}
