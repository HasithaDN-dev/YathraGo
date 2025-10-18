import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchVehicleDto, VehicleSearchResponseDto } from './dto';
import * as turf from '@turf/turf';

@Injectable()
export class FindVehicleService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate the shortest distance from a point to a line segment
   * @param point Customer's location [longitude, latitude]
   * @param lineSegment Driver's route segment [[lon1, lat1], [lon2, lat2]]
   * @returns Distance in kilometers
   */
  private pointToLineDistance(
    point: [number, number],
    lineSegment: [[number, number], [number, number]],
  ): number {
    const turfPoint = turf.point(point);
    const turfLine = turf.lineString(lineSegment);
    const distance = turf.pointToLineDistance(turfPoint, turfLine, {
      units: 'kilometers',
    });
    return distance;
  }

  /**
   * Find the nearest segment on the driver's route to a given point
   * @param point Customer location [longitude, latitude]
   * @param routeCoordinates Array of city coordinates in route order
   * @returns Object with segment index, distance, and position info
   */
  private findNearestSegment(
    point: [number, number],
    routeCoordinates: [number, number][],
  ): {
    segmentIndex: number;
    distance: number;
    isNearRoute: boolean;
  } {
    let minDistance = Infinity;
    let nearestSegmentIndex = -1;

    // Check each segment of the route
    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      const segment: [[number, number], [number, number]] = [
        routeCoordinates[i],
        routeCoordinates[i + 1],
      ];
      const distance = this.pointToLineDistance(point, segment);

      if (distance < minDistance) {
        minDistance = distance;
        nearestSegmentIndex = i;
      }
    }

    return {
      segmentIndex: nearestSegmentIndex,
      distance: minDistance,
      isNearRoute: minDistance <= 10, // Within 10 km threshold
    };
  }

  /**
   * Check if the driver's route is suitable for the customer's trip
   * The pickup must come before dropoff in the route order
   */
  private isRouteSuitableForTrip(
    pickupPoint: [number, number],
    dropPoint: [number, number],
    routeCoordinates: [number, number][],
    maxDistanceKm: number = 10,
  ): {
    isSuitable: boolean;
    pickupDistance: number;
    dropDistance: number;
    pickupSegment: number;
    dropSegment: number;
  } {
    const pickupResult = this.findNearestSegment(pickupPoint, routeCoordinates);
    const dropResult = this.findNearestSegment(dropPoint, routeCoordinates);

    // Check if both points are within acceptable distance from route
    const bothNearRoute =
      pickupResult.distance <= maxDistanceKm &&
      dropResult.distance <= maxDistanceKm;

    // Check if drop-off comes after pickup in the route
    const correctOrder = dropResult.segmentIndex > pickupResult.segmentIndex;

    return {
      isSuitable: bothNearRoute && correctOrder,
      pickupDistance: pickupResult.distance,
      dropDistance: dropResult.distance,
      pickupSegment: pickupResult.segmentIndex,
      dropSegment: dropResult.segmentIndex,
    };
  }

  // Format time from DateTime to HH:MM
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  async searchVehicles(
    searchDto: SearchVehicleDto,
  ): Promise<VehicleSearchResponseDto[]> {
    const { customerId, profileType, profileId, vehicleType, minRating } =
      searchDto;

    // 1. Get customer profile and determine pickup/drop coordinates
    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: customerId },
      include: {
        children: true,
        staffPassenger: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    let pickupLat: number, pickupLon: number, dropLat: number, dropLon: number;
    let rideType: 'School' | 'Work';

    // Determine pickup and drop coordinates based on profile type
    if (profileType === 'child') {
      if (!profileId) {
        throw new BadRequestException(
          'Child ID is required for child profile search',
        );
      }

      const child = customer.children.find((c) => c.child_id === profileId);
      if (!child) {
        throw new NotFoundException('Child profile not found');
      }

      if (
        !child.pickupLatitude ||
        !child.pickupLongitude ||
        !child.schoolLatitude ||
        !child.schoolLongitude
      ) {
        throw new BadRequestException(
          'Child pickup or school coordinates are missing',
        );
      }

      pickupLat = child.pickupLatitude;
      pickupLon = child.pickupLongitude;
      dropLat = child.schoolLatitude;
      dropLon = child.schoolLongitude;
      rideType = 'School';
    } else if (profileType === 'staff') {
      const staff = customer.staffPassenger;
      if (!staff) {
        throw new NotFoundException('Staff passenger profile not found');
      }

      if (
        !staff.pickupLatitude ||
        !staff.pickupLongitude ||
        !staff.workLatitude ||
        !staff.workLongitude
      ) {
        throw new BadRequestException(
          'Staff pickup or work coordinates are missing',
        );
      }

      pickupLat = staff.pickupLatitude;
      pickupLon = staff.pickupLongitude;
      dropLat = staff.workLatitude;
      dropLon = staff.workLongitude;
      rideType = 'Work';
    } else {
      throw new BadRequestException(
        'Invalid profile type. Must be "child" or "staff"',
      );
    }

    // 2. Get all active drivers with their cities and vehicles
    const drivers = await this.prisma.driver.findMany({
      where: {
        status: 'ACTIVE',
        // Only include drivers who have completed account setup
        registrationStatus: {
          in: ['ACCOUNT_CREATED', 'HAVING_A_PROFILE'],
        },
      },
      include: {
        driverCities: true,
        vehicles: true,
      },
    });

    console.log(
      `[FindVehicle] Found ${drivers.length} active drivers with complete profiles`,
    );

    // 3. Get all cities to map cityIds to coordinates
    const cities = await this.prisma.city.findMany();
    const cityMap = new Map(cities.map((city) => [city.id, city]));

    // 4. Search for suitable drivers using point-to-line distance
    const RADIUS_KM = 10; // Maximum distance from route in km
    const results: VehicleSearchResponseDto[] = [];

    // Customer's pickup and drop points in [longitude, latitude] format for Turf.js
    const pickupPoint: [number, number] = [pickupLon, pickupLat];
    const dropPoint: [number, number] = [dropLon, dropLat];

    for (const driver of drivers) {
      // Check if driver has DriverCities entry
      if (!driver.driverCities || driver.driverCities.length === 0) {
        console.log(
          `[FindVehicle] Driver ${driver.driver_id} (${driver.name}): No driverCities entries`,
        );
        continue;
      }

      const driverCity = driver.driverCities[0]; // Assuming one entry per driver

      // Filter by ride type
      if (driverCity.rideType !== 'Both' && driverCity.rideType !== rideType) {
        console.log(
          `[FindVehicle] Driver ${driver.driver_id} (${driver.name}): RideType mismatch - Driver: ${driverCity.rideType}, Required: ${rideType}`,
        );
        continue;
      }

      // Check if driver has any cities in route
      if (!driverCity.cityIds || driverCity.cityIds.length < 2) {
        console.log(
          `[FindVehicle] Driver ${driver.driver_id} (${driver.name}): Insufficient cities (${driverCity.cityIds?.length || 0})`,
        );
        continue; // Need at least 2 cities to form a route
      }

      // Build route coordinates from city IDs
      const routeCoordinates: [number, number][] = [];
      for (const cityId of driverCity.cityIds) {
        const city = cityMap.get(cityId);
        if (city) {
          // Turf.js uses [longitude, latitude] format
          routeCoordinates.push([city.longitude, city.latitude]);
        }
      }

      // Need at least 2 coordinates to form a route
      if (routeCoordinates.length < 2) {
        console.log(
          `[FindVehicle] Driver ${driver.driver_id} (${driver.name}): Not enough valid coordinates (${routeCoordinates.length})`,
        );
        continue;
      }

      // Check if route is suitable for this trip using point-to-line distance
      const routeCheck = this.isRouteSuitableForTrip(
        pickupPoint,
        dropPoint,
        routeCoordinates,
        RADIUS_KM,
      );

      console.log(
        `[FindVehicle] Driver ${driver.driver_id} (${driver.name}): Route check - Suitable: ${routeCheck.isSuitable}, ` +
          `Pickup: ${routeCheck.pickupDistance.toFixed(2)}km (seg ${routeCheck.pickupSegment}), ` +
          `Drop: ${routeCheck.dropDistance.toFixed(2)}km (seg ${routeCheck.dropSegment})`,
      );

      // Skip if route is not suitable
      if (!routeCheck.isSuitable) {
        continue;
      }

      // Filter by minimum rating if provided
      // Note: Driver rating is not in the schema, you may need to calculate it from reviews
      // For now, we'll use a placeholder value of 4.5
      const driverRating = 4.5; // TODO: Calculate from actual reviews
      if (minRating && driverRating < minRating) {
        continue;
      }

      // Get driver's vehicle
      const vehicle = driver.vehicles[0]; // Assuming driver has at least one vehicle
      if (!vehicle) {
        console.log(
          `[FindVehicle] Driver ${driver.driver_id} (${driver.name}): No vehicle found`,
        );
        continue;
      }

      // Filter by vehicle type if provided
      if (vehicleType && vehicle.type !== vehicleType) {
        console.log(
          `[FindVehicle] Driver ${driver.driver_id} (${driver.name}): Vehicle type mismatch - Driver: ${vehicle.type}, Required: ${vehicleType}`,
        );
        continue;
      }

      console.log(
        `[FindVehicle] ✓ Driver ${driver.driver_id} (${driver.name}) MATCHED!`,
      );

      // Get start and end city names
      const startCityId = driverCity.cityIds[0];
      const endCityId = driverCity.cityIds[driverCity.cityIds.length - 1];
      const startCity = cityMap.get(startCityId)?.name || 'Unknown';
      const endCity = cityMap.get(endCityId)?.name || 'Unknown';

      // Get all route city names
      const routeCities = driverCity.cityIds
        .map((id) => cityMap.get(id)?.name)
        .filter((name): name is string => name !== undefined);

      // Format times (handle null values) - TIME fields for display only
      const estimatedPickupTime = driverCity.usualStartTime
        ? this.formatTime(driverCity.usualStartTime)
        : undefined;
      const estimatedDropTime = driverCity.usualEndTime
        ? this.formatTime(driverCity.usualEndTime)
        : undefined;

      // Create response object
      results.push({
        driverId: driver.driver_id,
        driverName: driver.name,
        driverRating,
        driverPhone: driver.phone,
        vehicleId: vehicle.id,
        vehicleType: vehicle.type,
        vehicleBrand: vehicle.brand,
        vehicleModel: vehicle.model,
        vehicleRegistrationNumber: vehicle.registrationNumber || 'N/A',
        vehicleColor: vehicle.color,
        availableSeats: vehicle.no_of_seats,
        airConditioned: vehicle.air_conditioned,
        assistant: vehicle.assistant,
        startCity,
        endCity,
        routeCities,
        distanceFromPickup: Math.round(routeCheck.pickupDistance * 10) / 10,
        distanceFromDrop: Math.round(routeCheck.dropDistance * 10) / 10,
        estimatedPickupTime,
        estimatedDropTime,
      });
    }

    // Sort by closest pickup location first
    results.sort((a, b) => a.distanceFromPickup - b.distanceFromPickup);

    console.log(
      `[FindVehicle] Returning ${results.length} matched drivers for ${profileType} profile`,
    );

    return results;
  }

  // Method to get customer's profiles (children and staff)
  async getCustomerProfiles(customerId: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: customerId },
      include: {
        children: {
          select: {
            child_id: true,
            childFirstName: true,
            childLastName: true,
            school: true,
            pickUpAddress: true,
            pickupLatitude: true,
            pickupLongitude: true,
            schoolLatitude: true,
            schoolLongitude: true,
          },
        },
        staffPassenger: {
          select: {
            id: true,
            workLocation: true,
            workAddress: true,
            pickUpLocation: true,
            pickupAddress: true,
            pickupLatitude: true,
            pickupLongitude: true,
            workLatitude: true,
            workLongitude: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return {
      children: customer.children,
      staff: customer.staffPassenger,
    };
  }
}
