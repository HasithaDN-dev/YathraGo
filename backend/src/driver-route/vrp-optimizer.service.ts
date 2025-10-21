import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

interface RouteNode {
  id: string;
  type: 'origin' | 'pickup' | 'dropoff';
  childId?: number;
  latitude: number;
  longitude: number;
  address: string;
}

interface VRPResult {
  orderedStops: Array<{
    type: 'PICKUP' | 'DROPOFF';
    childId: number;
    lat: number;
    lng: number;
    eta: number;
    address: string;
  }>;
  polyline: string;
  legs: Array<{
    distance: { value: number };
    duration: { value: number };
    start_location: { lat: number; lng: number };
    end_location: { lat: number; lng: number };
  }>;
  diagnostics: {
    totalDistance: number;
    totalTime: number;
    solverStatus: string;
  };
}

interface PresentChild {
  childId: number;
  childName: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddress: string;
  schoolLatitude: number;
  schoolLongitude: number;
  schoolAddress: string;
}

@Injectable()
export class VRPOptimizerService {
  private readonly logger = new Logger(VRPOptimizerService.name);
  private readonly apiKey = process.env.GOOGLE_MAPS_API_KEY;

  constructor(private prisma: PrismaService) {}

  /**
   * Optimize morning route with pickup-before-dropoff constraints
   */
  async optimizeMorningRoute(
    driverId: number,
    driverLatitude?: number,
    driverLongitude?: number,
  ): Promise<VRPResult> {
    this.logger.log(`Starting morning route optimization for driver ${driverId}`);

    try {
      // Get driver's ride type
      const driverCity = await this.prisma.driverCities.findFirst({
        where: { driverId },
        select: { rideType: true },
      });
      const driverRideType = driverCity?.rideType || 'School';

      // Step 1: Get driver + all passenger pickup/dropoff coordinates
      const presentChildren = await this.getPresentAssignedChildren(driverId, driverRideType);
      
      if (presentChildren.length === 0) {
        const passengerType = driverRideType === 'Work' ? 'staff members' : 'students';
        throw new Error(`No present ${passengerType} assigned to this driver`);
      }

      // Step 2: Build a combined list of all locations
      const nodes = this.buildMorningNodes(presentChildren, driverLatitude, driverLongitude);

      if (nodes.length < 2) {
        throw new Error('Insufficient nodes for route optimization');
      }

      this.logger.log(`Built ${nodes.length} morning nodes: ${nodes.map(n => `${n.type}${n.childId ? `(${n.childId})` : ''}`).join(', ')}`);
      this.logger.log(`Morning route: Driver -> Pickup homes -> Dropoff school`);

      // Step 3: Query Google Distance Matrix for distances between all
      const travelMatrix = await this.getTravelTimeMatrix(nodes);

      // Step 4: Sort them using nearest-neighbor logic starting from driver's current location
      const orderedNodes = await this.solveVRPWithConstraints(nodes, travelMatrix);

      // Validate solution (every pickup before its dropoff)
      this.validatePickupDropoffOrder(orderedNodes);

      // Step 5: Send ordered list to Google Directions API to generate polyline
      const { polyline, legs } = await this.getRoutePolyline(orderedNodes);

      // Step 6: Return ordered stops, legs, and polyline to frontend
      const result = this.buildVRPResult(orderedNodes, legs, polyline);

      this.logger.log(`Morning route optimization completed for ${presentChildren.length} students`);
      return result;
    } catch (error) {
      this.logger.error(`Morning route optimization failed for driver ${driverId}:`, error);
      
      // Return fallback result
      return this.createFallbackResult(driverId, 'morning');
    }
  }

  /**
   * Optimize evening route with reversed pickup/dropoff logic
   */
  async optimizeEveningRoute(
    driverId: number,
    driverLatitude?: number,
    driverLongitude?: number,
  ): Promise<VRPResult> {
    this.logger.log(`Starting evening route optimization for driver ${driverId}`);

    try {
      // Get driver's ride type
      const driverCity = await this.prisma.driverCities.findFirst({
        where: { driverId },
        select: { rideType: true },
      });
      const driverRideType = driverCity?.rideType || 'School';

      // Step 1: Get driver + all passenger pickup/dropoff coordinates (evening: pickup from school/work, dropoff at home)
      const presentChildren = await this.getPresentAssignedChildren(driverId, driverRideType);
      
      if (presentChildren.length === 0) {
        const passengerType = driverRideType === 'Work' ? 'staff members' : 'students';
        throw new Error(`No present ${passengerType} assigned to this driver`);
      }

      // Step 2: Build a combined list of all locations (evening: reversed pickup/dropoff)
      const nodes = this.buildEveningNodes(presentChildren, driverLatitude, driverLongitude);

      if (nodes.length < 2) {
        throw new Error('Insufficient nodes for route optimization');
      }

      this.logger.log(`Built ${nodes.length} evening nodes: ${nodes.map(n => `${n.type}${n.childId ? `(${n.childId})` : ''}`).join(', ')}`);
      this.logger.log(`Evening route: Driver -> Pickup school -> Dropoff homes`);

      // Step 3: Query Google Distance Matrix for distances between all
      const travelMatrix = await this.getTravelTimeMatrix(nodes);

      // Step 4: Sort them using nearest-neighbor logic starting from driver's current location
      const orderedNodes = await this.solveVRPWithConstraints(nodes, travelMatrix);

      // Validate solution (every pickup before its dropoff)
      this.validatePickupDropoffOrder(orderedNodes);

      // Step 5: Send ordered list to Google Directions API to generate polyline
      const { polyline, legs } = await this.getRoutePolyline(orderedNodes);

      // Step 6: Return ordered stops, legs, and polyline to frontend
      const result = this.buildVRPResult(orderedNodes, legs, polyline);

      this.logger.log(`Evening route optimization completed for ${presentChildren.length} students`);
      return result;
    } catch (error) {
      this.logger.error(`Evening route optimization failed for driver ${driverId}:`, error);
      
      // Return fallback result
      return this.createFallbackResult(driverId, 'evening');
    }
  }

  /**
   * Get present assigned children for the driver
   */
  private async getPresentAssignedChildren(
    driverId: number,
    rideType: string = 'School',
  ): Promise<PresentChild[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // For Work type drivers, fetch from StaffRideRequest
    if (rideType === 'Work') {
      const staffRequests = await this.prisma.staffRideRequest.findMany({
        where: {
          driverId,
          status: 'Assigned',
        },
        include: {
          staffPassenger: {
            select: {
              id: true,
              pickupLatitude: true,
              pickupLongitude: true,
              pickupAddress: true,
              workLatitude: true,
              workLongitude: true,
              workAddress: true,
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      // No absence filtering for staff yet
      return staffRequests
        .filter((req) => 
          req.staffPassenger.pickupLatitude != null && 
          req.staffPassenger.pickupLongitude != null &&
          req.staffPassenger.workLatitude != null && 
          req.staffPassenger.workLongitude != null
        )
        .map((req) => ({
          childId: req.staffPassenger.id, // Using childId for compatibility
          childName: `${req.staffPassenger.customer.firstName} ${req.staffPassenger.customer.lastName}`,
          pickupLatitude: req.staffPassenger.pickupLatitude!,
          pickupLongitude: req.staffPassenger.pickupLongitude!,
          pickupAddress: req.staffPassenger.pickupAddress,
          schoolLatitude: req.staffPassenger.workLatitude!, // Using schoolLatitude for work location
          schoolLongitude: req.staffPassenger.workLongitude!,
          schoolAddress: req.staffPassenger.workAddress,
        }));
    }

    // For School type drivers, fetch from ChildRideRequest
    const assignedRequests = await this.prisma.childRideRequest.findMany({
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

    // Filter out absent students
    const absentToday = await this.prisma.absence_Child.findMany({
      where: {
        childId: { in: assignedRequests.map((r) => r.child.child_id) },
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: { childId: true },
    });

    const absentChildIds = new Set(absentToday.map((a) => a.childId));

    return assignedRequests
      .filter((req) => !absentChildIds.has(req.child.child_id))
      .filter((req) => 
        req.child.pickupLatitude != null && 
        req.child.pickupLongitude != null &&
        req.child.schoolLatitude != null && 
        req.child.schoolLongitude != null
      )
      .map((req) => ({
        childId: req.child.child_id,
        childName: `${req.child.childFirstName} ${req.child.childLastName}`,
        pickupLatitude: req.child.pickupLatitude!,
        pickupLongitude: req.child.pickupLongitude!,
        pickupAddress: req.child.pickUpAddress,
        schoolLatitude: req.child.schoolLatitude!,
        schoolLongitude: req.child.schoolLongitude!,
        schoolAddress: req.child.school,
      }));
  }

  /**
   * Build morning route nodes (origin -> pickups -> dropoffs)
   * Morning Route Notes:
   * - Driver starts from home (or current location)
   * - Pickup = child's home address (children from their homes)
   * - Dropoff = school address (children to school)
   * - Each child has 2 waypoints: pickup (home) and dropoff (school)
   */
  private buildMorningNodes(
    children: PresentChild[],
    driverLatitude?: number,
    driverLongitude?: number,
  ): RouteNode[] {
    const nodes: RouteNode[] = [];

    // Add origin (driver's location - typically driver's home)
    if (driverLatitude != null && driverLongitude != null) {
      nodes.push({
        id: 'origin',
        type: 'origin',
        latitude: driverLatitude,
        longitude: driverLongitude,
        address: 'Driver Location',
      });
    }

    // Add pickup nodes (child homes - children being picked up from their homes)
    children.forEach((child) => {
      nodes.push({
        id: `pickup_${child.childId}`,
        type: 'pickup',
        childId: child.childId,
        latitude: child.pickupLatitude,
        longitude: child.pickupLongitude,
        address: child.pickupAddress,
      });
    });

    // Add dropoff nodes (school - children being dropped off at school)
    children.forEach((child) => {
      nodes.push({
        id: `dropoff_${child.childId}`,
        type: 'dropoff',
        childId: child.childId,
        latitude: child.schoolLatitude,
        longitude: child.schoolLongitude,
        address: child.schoolAddress,
      });
    });

    return nodes;
  }

  /**
   * Build evening route nodes (origin -> pickups from school -> dropoffs at homes)
   * Evening Route Notes:
   * - Driver starts from school (or current location if near school)
   * - Pickup = school address (children from school)
   * - Dropoff = child's home address
   * - Last dropped child in morning should be the first pickup in the evening
   */
  private buildEveningNodes(
    children: PresentChild[],
    driverLatitude?: number,
    driverLongitude?: number,
  ): RouteNode[] {
    const nodes: RouteNode[] = [];

    // For evening route, driver typically starts from school
    // Use driver's current location if provided, otherwise use school as origin
    if (driverLatitude != null && driverLongitude != null) {
      nodes.push({
        id: 'origin',
        type: 'origin',
        latitude: driverLatitude,
        longitude: driverLongitude,
        address: 'Driver Location',
      });
    } else {
      // If no driver location, start from school (first child's school)
      const firstChild = children[0];
      if (firstChild) {
        nodes.push({
          id: 'origin',
          type: 'origin',
          latitude: firstChild.schoolLatitude,
          longitude: firstChild.schoolLongitude,
          address: firstChild.schoolAddress,
        });
      }
    }

    // Add pickup nodes (school - children being picked up from school)
    children.forEach((child) => {
      nodes.push({
        id: `pickup_${child.childId}`,
        type: 'pickup',
        childId: child.childId,
        latitude: child.schoolLatitude,
        longitude: child.schoolLongitude,
        address: child.schoolAddress,
      });
    });

    // Add dropoff nodes (child homes - children being dropped off at their homes)
    children.forEach((child) => {
      nodes.push({
        id: `dropoff_${child.childId}`,
        type: 'dropoff',
        childId: child.childId,
        latitude: child.pickupLatitude,
        longitude: child.pickupLongitude,
        address: child.pickupAddress,
      });
    });

    return nodes;
  }

  /**
   * Get travel time matrix using Google Distance Matrix API
   */
  private async getTravelTimeMatrix(nodes: RouteNode[]): Promise<number[][]> {
    if (!this.apiKey) {
      this.logger.warn('Google Maps API key not configured, using fallback matrix');
      return this.createFallbackMatrix(nodes);
    }

    try {
      // Build origins and destinations for distance matrix
      const origins = nodes.map(node => `${node.latitude},${node.longitude}`);
      const destinations = origins; // Same as origins for full matrix

      const params = new URLSearchParams({
        origins: origins.join('|'),
        destinations: destinations.join('|'),
        key: this.apiKey,
      });

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`,
        {
          timeout: 30000,
        }
      );

      if (response.data?.status === 'OK' && response.data?.rows) {
        // Convert response to matrix format
        const matrix: number[][] = [];
        for (const row of response.data.rows) {
          const rowData: number[] = [];
          for (const element of row.elements) {
            if (element.status === 'OK') {
              rowData.push(element.duration?.value || 0);
            } else {
              this.logger.warn(`Matrix element failed: ${element.status}`);
              rowData.push(0); // Use 0 for failed elements
            }
          }
          matrix.push(rowData);
        }

        return matrix;
      }

      this.logger.warn('Google Distance Matrix API returned no valid data');
      return this.createFallbackMatrix(nodes);
    } catch (error) {
      this.logger.error('Error fetching travel time matrix:', error);
      
      // Return fallback matrix with estimated times
      return this.createFallbackMatrix(nodes);
    }
  }

  /**
   * Create fallback matrix with estimated travel times
   */
  private createFallbackMatrix(nodes: RouteNode[]): number[][] {
    const matrix: number[][] = [];
    
    for (let i = 0; i < nodes.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) {
          row.push(0);
        } else {
          // Estimate 5 minutes per stop
          row.push(300);
        }
      }
      matrix.push(row);
    }
    
    return matrix;
  }

  /**
   * Solve route ordering using nearest-neighbor algorithm with pickup-before-dropoff constraint
   * Following the 6-step process:
   * 1. Get driver + all child pickup/dropoff coordinates
   * 2. Build a combined list of all locations
   * 3. Query Google Distance Matrix for distances between all
   * 4. Sort them using nearest-neighbor logic starting from driver's current location
   * 5. Send ordered list to Google Directions API to generate polyline
   * 6. Return ordered stops, legs, and polyline to frontend
   */
  private async solveVRPWithConstraints(
    nodes: RouteNode[],
    travelMatrix: number[][],
  ): Promise<RouteNode[]> {
    this.logger.log('Attempting OR-Tools optimization with per-child pickup->dropoff constraints');

    try {
      // Dynamically require ortools so code still runs if package missing
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { ortools } = require('ortools');

      // Build mapping of pickup and dropoff node indices per child
      const pickupIndexByChild = new Map<number, number>();
      const dropoffIndexByChild = new Map<number, number>();

      nodes.forEach((n, idx) => {
        if (n.type === 'pickup' && n.childId != null) pickupIndexByChild.set(n.childId, idx);
        if (n.type === 'dropoff' && n.childId != null) dropoffIndexByChild.set(n.childId, idx);
      });

      const numNodes = nodes.length;
      const numVehicles = 1;

      // Find depot/origin
      const originIndex = nodes.findIndex((n) => n.type === 'origin');
      const depot = originIndex !== -1 ? originIndex : 0;

      const routing = new ortools.constraint_solver.RoutingModel(numNodes, numVehicles, depot);

      const distanceCallback = (fromIndex: number, toIndex: number) => {
        return Math.max(0, Math.floor(travelMatrix[fromIndex][toIndex] || 0));
      };

      const transitCallbackIndex = routing.RegisterTransitCallback(distanceCallback);
      routing.SetArcCostEvaluatorOfAllVehicles(transitCallbackIndex);

      // Add pickup-delivery pairs per child
      for (const [childId, pIdx] of pickupIndexByChild) {
        const dIdx = dropoffIndexByChild.get(childId);
        if (dIdx == null) continue;

        routing.AddPickupAndDelivery(pIdx, dIdx);
        routing.solver().Add(
          routing.solver().MakeLessOrEqual(routing.VehicleVar(pIdx), routing.VehicleVar(dIdx)),
        );
      }

      const searchParameters = ortools.constraint_solver.defaultRoutingSearchParameters();
      searchParameters.firstSolutionStrategy = ortools.constraint_solver.FirstSolutionStrategy.PATH_CHEAPEST_ARC;
      searchParameters.timeLimit = { seconds: 5 };

      const solution = routing.SolveWithParameters(searchParameters);
      if (!solution) {
        throw new Error('No solution found by OR-Tools solver');
      }

      const orderedNodes: RouteNode[] = [];
      let index = routing.Start(0);
      while (!routing.IsEnd(index)) {
        const nodeIdx = index;
        orderedNodes.push(nodes[nodeIdx]);
        index = solution.Value(routing.NextVar(index));
      }

      this.logger.log(`OR-Tools produced ordered ${orderedNodes.length} nodes`);
      return orderedNodes;
    } catch (err) {
      this.logger.error('OR-Tools optimization failed or not available, falling back to greedy:', err);
      return this.greedyOptimization(nodes, travelMatrix);
    }
  }

  /**
   * Fallback greedy optimization algorithm
   */
  private greedyOptimization(nodes: RouteNode[], travelMatrix: number[][]): RouteNode[] {
    const ordered: RouteNode[] = [];
    const remaining = [...nodes];
    const pickedUpChildren = new Set<number>();

    // Start from origin or first node
    let currentIndex = 0;
    if (remaining[0].type === 'origin') {
      ordered.push(remaining.shift()!);
    }

    while (remaining.length > 0) {
      let bestNode: RouteNode | null = null;
      let bestIndex = -1;
      let bestTime = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const node = remaining[i];

        // Constraint: Can only do dropoff if child has been picked up
        if (node.type === 'dropoff' && !pickedUpChildren.has(node.childId!)) {
          continue;
        }

        const time = travelMatrix[currentIndex][nodes.indexOf(node)];
        if (time < bestTime) {
          bestTime = time;
          bestNode = node;
          bestIndex = i;
        }
      }

      if (bestNode) {
        ordered.push(bestNode);
        remaining.splice(bestIndex, 1);

        if (bestNode.type === 'pickup') {
          pickedUpChildren.add(bestNode.childId!);
        }

        currentIndex = nodes.indexOf(bestNode);
      } else {
        // If no valid node found, take first remaining
        if (remaining.length > 0) {
          ordered.push(remaining[0]);
          remaining.splice(0, 1);
        }
      }
    }

    return ordered;
  }

  /**
   * Validate that every pickup occurs before its corresponding dropoff
   */
  private validatePickupDropoffOrder(nodes: RouteNode[]): void {
    const pickupPositions = new Map<number, number>();
    const dropoffPositions = new Map<number, number>();

    nodes.forEach((node, index) => {
      if (node.type === 'pickup' && node.childId) {
        pickupPositions.set(node.childId, index);
      } else if (node.type === 'dropoff' && node.childId) {
        dropoffPositions.set(node.childId, index);
      }
    });

    for (const [childId, pickupPos] of pickupPositions) {
      const dropoffPos = dropoffPositions.get(childId);
      if (dropoffPos !== undefined && pickupPos >= dropoffPos) {
        throw new Error(`Invalid route: Child ${childId} pickup (${pickupPos}) must occur before dropoff (${dropoffPos})`);
      }
    }
  }

  /**
   * Get route polyline and legs using Google Directions API
   */
  private async getRoutePolyline(nodes: RouteNode[]): Promise<{ polyline: string; legs: any[] }> {
    if (!this.apiKey) {
      return { polyline: '', legs: [] };
    }

    if (nodes.length < 2) {
      return { polyline: '', legs: [] };
    }

    try {
      // Step 5: Send ordered list to Google Directions API to generate polyline
      // Use the exact order from our optimization (don't let Google re-optimize)
      const waypoints = nodes
        .filter(node => node.type !== 'origin')
        .map(node => `${node.latitude},${node.longitude}`)
        .join('|');

      const origin = `${nodes[0].latitude},${nodes[0].longitude}`;
      const destination = `${nodes[nodes.length - 1].latitude},${nodes[nodes.length - 1].longitude}`;

      // Don't use optimize:true since we already have the optimal order
      const params = new URLSearchParams({
        origin,
        destination,
        waypoints: waypoints, // Use exact order, no optimization
        key: this.apiKey,
      });

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`,
        {
          timeout: 30000,
        }
      );

      if (response.data?.status === 'OK' && response.data?.routes?.[0]) {
        const route = response.data.routes[0];
        const polyline = route.overview_polyline?.points || '';
        
        this.logger.log(`Generated polyline: ${polyline.substring(0, 50)}...`);
        
        return {
          polyline,
          legs: route.legs || [],
        };
      }

      this.logger.warn('Google Directions API returned no valid route');
      return { polyline: '', legs: [] };
    } catch (error) {
      this.logger.error('Error fetching route polyline:', error);
      return { polyline: '', legs: [] };
    }
  }

  /**
   * Build final VRP result
   */
  private buildVRPResult(
    orderedNodes: RouteNode[],
    legs: any[],
    polyline: string,
  ): VRPResult {
    const now = Math.floor(Date.now() / 1000);
    let cumulativeTime = 0;

    const orderedStops = orderedNodes
      .filter(node => node.type !== 'origin')
      .map((node, index) => {
        const legTime = legs[index]?.duration?.value || 0; // Changed from .seconds to .value
        cumulativeTime += legTime;

        return {
          type: node.type.toUpperCase() as 'PICKUP' | 'DROPOFF',
          childId: node.childId!,
          lat: node.latitude,
          lng: node.longitude,
          eta: now + cumulativeTime,
          address: node.address,
        };
      });

    const totalDistance = legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0);
    const totalTime = legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0);

    this.logger.log(`Building VRP result with polyline: ${polyline.substring(0, 50)}...`);

    return {
      orderedStops,
      polyline,
      legs,
      diagnostics: {
        totalDistance,
        totalTime,
        solverStatus: 'OPTIMAL',
      },
    };
  }

  /**
   * Create fallback result when optimization fails
   */
  private async createFallbackResult(driverId: number, routeType: 'morning' | 'evening'): Promise<VRPResult> {
    this.logger.warn(`Creating fallback result for driver ${driverId}, route type: ${routeType}`);
    
    try {
      // Get driver's ride type
      const driverCity = await this.prisma.driverCities.findFirst({
        where: { driverId },
        select: { rideType: true },
      });
      const driverRideType = driverCity?.rideType || 'School';

      const presentChildren = await this.getPresentAssignedChildren(driverId, driverRideType);
      
      if (presentChildren.length === 0) {
        return {
          orderedStops: [],
          polyline: '',
          legs: [],
          diagnostics: {
            totalDistance: 0,
            totalTime: 0,
            solverStatus: 'NO_SOLUTION',
          },
        };
      }

      // Create simple ordered stops without optimization
      const orderedStops = presentChildren.flatMap(child => {
        if (routeType === 'morning') {
          return [
            {
              type: 'PICKUP' as const,
              childId: child.childId,
              lat: child.pickupLatitude,
              lng: child.pickupLongitude,
              eta: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now
              address: child.pickupAddress,
            },
            {
              type: 'DROPOFF' as const,
              childId: child.childId,
              lat: child.schoolLatitude,
              lng: child.schoolLongitude,
              eta: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
              address: child.schoolAddress,
            },
          ];
        } else {
          return [
            {
              type: 'PICKUP' as const,
              childId: child.childId,
              lat: child.schoolLatitude,
              lng: child.schoolLongitude,
              eta: Math.floor(Date.now() / 1000) + 300,
              address: child.schoolAddress,
            },
            {
              type: 'DROPOFF' as const,
              childId: child.childId,
              lat: child.pickupLatitude,
              lng: child.pickupLongitude,
              eta: Math.floor(Date.now() / 1000) + 600,
              address: child.pickupAddress,
            },
          ];
        }
      });

      return {
        orderedStops,
        polyline: '',
        legs: [],
        diagnostics: {
          totalDistance: 0,
          totalTime: 0,
          solverStatus: 'FALLBACK',
        },
      };
    } catch (error) {
      this.logger.error('Error creating fallback result:', error);
      
      return {
        orderedStops: [],
        polyline: '',
        legs: [],
        diagnostics: {
          totalDistance: 0,
          totalTime: 0,
          solverStatus: 'ERROR',
        },
      };
    }
  }
}
