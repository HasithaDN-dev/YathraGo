// src/driver/driver.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { CompleteDriverRegistrationDto } from './dto/complete-driver-registration.dto'; // Import the new DTO
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Your existing JwtAuthGuard
import { UserType } from '@prisma/client';
import { Request } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerConfigVehicle } from 'src/common/services/multer.config';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { computeGreedyOrder } from './optimizer.util';

// Extend Request to include user property from JwtPayload
// This interface MUST match what your JwtStrategy returns in its validate method.
// Based on your provided JwtStrategy, it returns:
// { sub: string, phone: string, userType: UserType, isVerified: boolean }
interface AuthenticatedRequest extends Request {
  user: {
    sub: string; // This is payload.sub (driver_id or customer_id as string)
    phone: string;
    userType: UserType;
    isVerified: boolean;
  };
}

@Controller('driver') // Base route for driver-related operations
export class DriverController {
  constructor(
    private driverService: DriverService,
    private prisma: PrismaService,
  ) {}

  // --- NEW ENDPOINT FOR SINGLE-PHASE DRIVER REGISTRATION (SECURE) ---
  @UseGuards(JwtAuthGuard) // Protect with JWT Guard
  @Post('register') // A single endpoint for the complete registration
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profileImage', maxCount: 1 },
        { name: 'idFrontImage', maxCount: 1 },
        { name: 'idBackImage', maxCount: 1 },
        { name: 'vehicleFrontView', maxCount: 1 },
        { name: 'vehicleSideView', maxCount: 1 },
        { name: 'vehicleRearView', maxCount: 1 },
        { name: 'vehicleInteriorView', maxCount: 1 },
        { name: 'revenueLicense', maxCount: 1 },
        { name: 'vehicleInsurance', maxCount: 1 },
        { name: 'registrationDoc', maxCount: 1 },
        { name: 'licenseFront', maxCount: 1 },
        { name: 'licenseBack', maxCount: 1 },
      ],
      multerConfigVehicle,
    ),
  )
  @HttpCode(HttpStatus.OK)
  async registerDriver(
    @Req() req: AuthenticatedRequest, // Get authenticated user info
    @UploadedFiles()
    files: {
      profileImage?: Express.Multer.File[];
      idFrontImage?: Express.Multer.File[];
      idBackImage?: Express.Multer.File[];
      vehicleFrontView?: Express.Multer.File[];
      vehicleSideView?: Express.Multer.File[];
      vehicleRearView?: Express.Multer.File[];
      vehicleInteriorView?: Express.Multer.File[];
      revenueLicense?: Express.Multer.File[];
      vehicleInsurance?: Express.Multer.File[];
      registrationDoc?: Express.Multer.File[];
      licenseFront?: Express.Multer.File[];
      licenseBack?: Express.Multer.File[];
    },
    @Body() registrationData: any,
  ) {
    const phone = req.user.phone; // Securely get phone from JWT

    // Use image URI from registrationData (frontend string)
    const safeFiles = files || {};
    const profileImageUrl = registrationData.profileImage || null;
    const idFrontImageUrl = safeFiles.idFrontImage?.[0]?.filename
      ? `uploads/vehicle/${safeFiles.idFrontImage[0].filename}`
      : null;
    const idBackImageUrl = safeFiles.idBackImage?.[0]?.filename
      ? `uploads/vehicle/${safeFiles.idBackImage[0].filename}`
      : null;
    const vehicleFrontViewUrl = safeFiles.vehicleFrontView?.[0]?.filename
      ? `uploads/vehicle/${safeFiles.vehicleFrontView[0].filename}`
      : null;
    const vehicleSideViewUrl = safeFiles.vehicleSideView?.[0]?.filename
      ? `uploads/vehicle/${safeFiles.vehicleSideView[0].filename}`
      : null;
    const vehicleRearViewUrl = safeFiles.vehicleRearView?.[0]?.filename
      ? `uploads/vehicle/${safeFiles.vehicleRearView[0].filename}`
      : null;
    const vehicleInteriorViewUrl = safeFiles.vehicleInteriorView?.[0]?.filename
      ? `uploads/vehicle/${safeFiles.vehicleInteriorView[0].filename}`
      : null;
    const revenueLicenseUrl = safeFiles.revenueLicense?.[0]?.filename
      ? `uploads/vehicle/${safeFiles.revenueLicense[0].filename}`
      : null;
    const vehicleInsuranceUrl = safeFiles.vehicleInsurance?.[0]?.filename
      ? `uploads/vehicle/${safeFiles.vehicleInsurance[0].filename}`
      : null;
    const registrationDocUrl = safeFiles.registrationDoc?.[0]?.filename
      ? `uploads/vehicle/${safeFiles.registrationDoc[0].filename}`
      : null;
    const licenseFrontUrl = safeFiles.licenseFront?.[0]?.filename
      ? `uploads/vehicle/${safeFiles.licenseFront[0].filename}`
      : null;
    const licenseBackUrl = safeFiles.licenseBack?.[0]?.filename
      ? `uploads/vehicle/${safeFiles.licenseBack[0].filename}`
      : null;

    // Prepare the registration data with file URLs
    const completeRegistrationData: CompleteDriverRegistrationDto = {
      name: `${registrationData.firstName || ''} ${registrationData.lastName || ''}`,
      NIC: registrationData.NIC || '',
      address: registrationData.city || '',
      date_of_birth: registrationData.dateOfBirth || '',
      gender: registrationData.gender || 'Not specified',
      profile_picture_url: profileImageUrl || '',
      email: registrationData.email || '',
      driver_license_front_url: licenseFrontUrl || '',
      driver_license_back_url: licenseBackUrl || '',
      nic_front_pic_url: idFrontImageUrl || '',
      nice_back_pic_url: idBackImageUrl || '',
      second_phone: registrationData.secondaryPhone || '',
      vehicle_Reg_No: registrationData.licensePlate || '',
      // Vehicle information
      vehicleType: registrationData.vehicleType,
      vehicleBrand: registrationData.vehicleBrand,
      vehicleModel: registrationData.vehicleModel,
      yearOfManufacture: registrationData.yearOfManufacture,
      vehicleColor: registrationData.vehicleColor,
      licensePlate: registrationData.licensePlate,
      seats: registrationData.seats
        ? parseInt(registrationData.seats.toString())
        : undefined,
      femaleAssistant:
        registrationData.femaleAssistant === 'true' ||
        registrationData.femaleAssistant === true,
      // Vehicle images
      vehicleFrontView: vehicleFrontViewUrl ?? undefined,
      vehicleSideView: vehicleSideViewUrl ?? undefined,
      vehicleRearView: vehicleRearViewUrl ?? undefined,
      vehicleInteriorView: vehicleInteriorViewUrl ?? undefined,
      // Vehicle documents
      revenueLicenseUrl: revenueLicenseUrl ?? undefined,
      vehicleInsuranceUrl: vehicleInsuranceUrl ?? undefined,
      registrationDocUrl: registrationDocUrl ?? undefined,
    };

    return this.driverService.completeDriverRegistration(
      phone,
      completeRegistrationData,
    );
  }

  // --- PROFILE MANAGEMENT ENDPOINTS ---
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getDriverProfile(@Req() req: AuthenticatedRequest) {
    const driverId = req.user.sub; // Get driver ID from JWT token
    return this.driverService.getDriverProfile(driverId);
  }

  // --- AUTHENTICATED ENDPOINT TO GET DRIVER TRIP HISTORY ---
  @UseGuards(JwtAuthGuard)
  @Get('trip-history')
  @HttpCode(HttpStatus.OK)
  async getDriverTripHistory(@Req() req: AuthenticatedRequest) {
    const driverId = req.user.sub; // Get driver ID from JWT token
    return this.driverService.getDriverTripHistory(driverId);
  }

  // --- AUTHENTICATED ENDPOINT TO GET DRIVER DETAILS ---
  @UseGuards(JwtAuthGuard)
  @Get('details')
  @HttpCode(HttpStatus.OK)
  async getDriverDetails(@Req() req: AuthenticatedRequest) {
    const driverId = req.user.sub; // Get driver ID from JWT token
    return this.driverService.getDriverDetailsById(parseInt(driverId, 10));
  }

  // --- Minimal route optimization endpoint ---
  @UseGuards(JwtAuthGuard)
  @Post('optimize-route')
  @HttpCode(HttpStatus.OK)
  async optimizeRoute(
    @Req() req: AuthenticatedRequest,
    @Body() body: { latitude?: number; longitude?: number },
  ) {
    const driverId = parseInt(req.user.sub, 10); // Get driver ID from JWT token
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return { error: 'Server maps key not configured' };
    }

    // 1) Load assigned children with confirmed coordinates
    const assignedRequests = await this.prisma.childRideRequest.findMany({
      where: { driverId, status: 'Assigned' },
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
    });

    // 2) Filter out absent students for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const absentToday = await this.prisma.absence_Child.findMany({
      where: {
        childId: { in: assignedRequests.map((r) => r.child.child_id) },
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        childId: true,
      },
    });

    const absentChildIds = new Set(absentToday.map((a) => a.childId));

    // 3) Filter to get only present students
    const requests = assignedRequests.filter(
      (r) => !absentChildIds.has(r.child.child_id),
    );

    // 4) Build stops array from present students only
    const origin =
      body?.latitude != null && body?.longitude != null
        ? { lat: body.latitude, lng: body.longitude }
        : null;

    const stops: Array<{
      lat: number;
      lng: number;
      type: 'pickup' | 'dropoff';
      childId: number;
      address: string;
      childName: string;
    }> = [];

    for (const r of requests) {
      const c = r.child;
      const childName =
        `${c.childFirstName || ''} ${c.childLastName || ''}`.trim() ||
        `Student ${c.child_id}`;

      if (c.pickupLatitude != null && c.pickupLongitude != null) {
        stops.push({
          lat: c.pickupLatitude,
          lng: c.pickupLongitude,
          type: 'pickup',
          childId: c.child_id,
          address: c.pickUpAddress,
          childName,
        });
      }
      if (c.schoolLatitude != null && c.schoolLongitude != null) {
        stops.push({
          lat: c.schoolLatitude,
          lng: c.schoolLongitude,
          type: 'dropoff',
          childId: c.child_id,
          address: c.school ?? '',
          childName,
        });
      }
    }

    if (stops.length === 0) {
      return {
        degraded: true,
        message: 'No present students with valid locations',
        stops: [],
        totalDistanceMeters: 0,
        totalDurationSecs: 0,
        polyline: null,
      };
    }

    // If no driver location provided, cannot optimize geographically
    if (!origin) {
      return {
        degraded: true,
        message: 'Driver location required for route optimization',
        stops: [],
        totalDistanceMeters: 0,
        totalDurationSecs: 0,
        polyline: null,
      };
    }

    // 5) Build Distance Matrix with driver location as origin
    const makeLoc = (p: { lat: number; lng: number }) => `${p.lat},${p.lng}`;
    const points = stops.map((s) => ({ lat: s.lat, lng: s.lng }));

    // Build distance matrix: driver location + all stops as origins, all stops as destinations
    const dmOrigins: string[] = [makeLoc(origin)]; // Driver's location first
    points.forEach((p) => dmOrigins.push(makeLoc(p))); // Then all stops
    const dmDestinations = points.map(makeLoc);

    let degraded = false;
    let matrix: { distances: number[][]; durations: number[][] } | null = null;

    try {
      const params = new URLSearchParams();
      params.append('origins', dmOrigins.join('|'));
      params.append('destinations', dmDestinations.join('|'));
      params.append('key', apiKey);
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
      const res = await axios.get(url, { timeout: 15000 });

      if (res.data?.status === 'OK') {
        const rows = res.data?.rows || [];
        const durations: number[][] = rows.map((row: any) =>
          row.elements.map((e: any) => e?.duration?.value ?? 0),
        );
        const distances: number[][] = rows.map((row: any) =>
          row.elements.map((e: any) => e?.distance?.value ?? 0),
        );
        matrix = { durations, distances };
      } else {
        console.error('Google Maps API error:', res.data?.status);
        degraded = true;
      }
    } catch (e) {
      console.error('Error fetching distance matrix:', e);
      degraded = true;
    }

    // If matrix failed, cannot proceed with geographical optimization
    if (!matrix) {
      return {
        degraded: true,
        message: 'Failed to fetch distance matrix from Google Maps',
        stops: [],
        totalDistanceMeters: 0,
        totalDurationSecs: 0,
        polyline: null,
      };
    }

    // 6) Greedy constrained order: pickup before dropoff, optional capacity
    const driverVehicle = await this.prisma.vehicle.findFirst({
      where: { driverId },
    });
    const capacity = driverVehicle?.no_of_seats ?? null; // null means ignore capacity

    // Use greedy algorithm starting from driver's location (index 0 in matrix)
    const ordered = computeGreedyOrder(stops, matrix, capacity, 0);

    // 7) Compute ETAs and cumulative distances
    let totalDurationSecs = 0;
    let totalDistanceMeters = 0;
    const now = Math.floor(Date.now() / 1000);
    const stopsOut: Array<{
      lat: number;
      lng: number;
      type: 'pickup' | 'dropoff';
      childId: number;
      address: string;
      childName: string;
      etaSecs: number;
      legDistanceMeters: number;
    }> = [];

    // Start from driver's location (index 0 in matrix)
    let prevIndexForMatrix = 0;

    for (let i = 0; i < ordered.length; i++) {
      const s = ordered[i];
      let legDuration = 0;
      let legDistance = 0;

      const destIdx = stops.indexOf(s);
      legDuration = matrix.durations[prevIndexForMatrix]?.[destIdx] ?? 0;
      legDistance = matrix.distances[prevIndexForMatrix]?.[destIdx] ?? 0;

      // Next origin is this stop (add 1 because driver location is at index 0)
      prevIndexForMatrix = 1 + destIdx;

      totalDurationSecs += legDuration;
      totalDistanceMeters += legDistance;

      stopsOut.push({
        ...s,
        etaSecs: now + totalDurationSecs,
        legDistanceMeters: legDistance,
      });
    }

    // 8) Fetch Directions polyline for ordered path
    let polyline: string | null = null;
    try {
      const originStr = `${origin.lat},${origin.lng}`;
      const destinationStr = `${ordered[ordered.length - 1].lat},${ordered[ordered.length - 1].lng}`;

      // All stops except the last one are waypoints
      const waypoints = ordered.slice(0, ordered.length - 1);
      const waypointStr = waypoints.map((s) => `${s.lat},${s.lng}`).join('|');

      const params = new URLSearchParams();
      params.append('origin', originStr);
      params.append('destination', destinationStr);
      if (waypoints.length > 0) {
        params.append('waypoints', waypointStr);
      }
      params.append('key', apiKey);

      const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`;
      const res = await axios.get(url, { timeout: 15000 });

      if (res.data?.routes?.[0]?.overview_polyline?.points) {
        polyline = res.data.routes[0].overview_polyline.points;
      } else {
        console.error('No polyline in directions response');
        degraded = true;
      }
    } catch (_e) {
      console.error('Error fetching directions polyline:', _e);
      degraded = true;
    }

    return {
      degraded,
      totalDistanceMeters,
      totalDurationSecs,
      polyline,
      stops: stopsOut,
    };
  }

  // Minimal waypoint status update (no-op if not persisted)
  @Patch('route/waypoint/:id')
  @HttpCode(HttpStatus.OK)
  async updateWaypointStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
  ) {
    try {
      const updated = await this.prisma.routeWaypoint.update({
        where: { id },
        data: { status: body.status },
      });
      return updated;
    } catch (e) {
      return { ok: false };
    }
  }

  // Get driver route cities (start and end points)
  @Get('route-cities')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getDriverRouteCities(@Req() req: AuthenticatedRequest) {
    try {
      const driverId = parseInt(req.user.sub, 10);

      // Get driver's city IDs
      const driverCities = await this.prisma.driverCities.findUnique({
        where: { driverId },
      });

      if (
        !driverCities ||
        !driverCities.cityIds ||
        driverCities.cityIds.length === 0
      ) {
        return {
          success: false,
          message: 'No route cities found for driver',
        };
      }

      const firstCityId = driverCities.cityIds[0];
      const lastCityId = driverCities.cityIds[driverCities.cityIds.length - 1];

      // Fetch city names and coordinates
      const cities = await this.prisma.city.findMany({
        where: {
          id: { in: [firstCityId, lastCityId] },
        },
      });

      const startCity = cities.find((c) => c.id === firstCityId);
      const endCity = cities.find((c) => c.id === lastCityId);

      return {
        success: true,
        startPoint: startCity?.name || 'Unknown',
        endPoint: endCity?.name || 'Unknown',
        startCityId: firstCityId,
        endCityId: lastCityId,
        startLatitude: startCity?.latitude,
        startLongitude: startCity?.longitude,
        endLatitude: endCity?.latitude,
        endLongitude: endCity?.longitude,
      };
    } catch (error) {
      console.error('Error fetching driver route cities:', error);
      return {
        success: false,
        message: 'Failed to fetch route cities',
      };
    }
  }

  // Get driver route cities with ETA
  @Get('route-cities-with-eta')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getDriverRouteCitiesWithETA(@Req() req: AuthenticatedRequest) {
    try {
      const driverId = parseInt(req.user.sub, 10);
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        return {
          success: false,
          message: 'Server maps key not configured',
        };
      }

      // Get driver's city IDs
      const driverCities = await this.prisma.driverCities.findUnique({
        where: { driverId },
      });

      if (
        !driverCities ||
        !driverCities.cityIds ||
        driverCities.cityIds.length === 0
      ) {
        return {
          success: false,
          message: 'No route cities found for driver',
        };
      }

      const firstCityId = driverCities.cityIds[0];
      const lastCityId = driverCities.cityIds[driverCities.cityIds.length - 1];

      // Fetch city details with coordinates
      const cities = await this.prisma.city.findMany({
        where: {
          id: { in: [firstCityId, lastCityId] },
        },
      });

      const startCity = cities.find((c) => c.id === firstCityId);
      const endCity = cities.find((c) => c.id === lastCityId);

      if (!startCity || !endCity) {
        return {
          success: false,
          message: 'City details not found',
        };
      }

      // Calculate ETA using Google Maps Distance Matrix API
      let etaMinutes: number | null = null;
      let distanceKm: number | null = null;

      try {
        const origin = `${startCity.latitude},${startCity.longitude}`;
        const destination = `${endCity.latitude},${endCity.longitude}`;

        const params = new URLSearchParams();
        params.append('origins', origin);
        params.append('destinations', destination);
        params.append('key', apiKey);
        params.append('mode', 'driving');

        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
        const response = await axios.get(url, { timeout: 10000 });

        if (response.data?.rows?.[0]?.elements?.[0]?.status === 'OK') {
          const element = response.data.rows[0].elements[0];
          const durationSeconds = element.duration?.value || 0;
          const distanceMeters = element.distance?.value || 0;

          etaMinutes = Math.ceil(durationSeconds / 60);
          distanceKm = parseFloat((distanceMeters / 1000).toFixed(1));
        }
      } catch (error) {
        console.error('Error calculating ETA:', error);
        // Continue without ETA if API fails
      }

      return {
        success: true,
        startPoint: startCity.name,
        endPoint: endCity.name,
        startCityId: firstCityId,
        endCityId: lastCityId,
        startLatitude: startCity.latitude,
        startLongitude: startCity.longitude,
        endLatitude: endCity.latitude,
        endLongitude: endCity.longitude,
        etaMinutes,
        distanceKm,
      };
    } catch (error) {
      console.error('Error fetching route cities with ETA:', error);
      return {
        success: false,
        message: 'Failed to fetch route cities with ETA',
      };
    }
  }

  // Mark attendance for pickup/dropoff
  @Post('mark-attendance')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markAttendance(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      childId: number;
      type: 'pickup' | 'dropoff';
      routeType?: 'MORNING_PICKUP' | 'AFTERNOON_DROPOFF';
      latitude?: number;
      longitude?: number;
      notes?: string;
      status?: string;
    },
  ) {
    try {
      const driverId = parseInt(req.user.sub, 10);

      // Determine session-aware attendance type
      // Default to morning session if routeType not provided (backward compatibility)
      const routeType = body.routeType || 'MORNING_PICKUP';
      let attendanceType: 'MORNING_PICKUP' | 'MORNING_DROPOFF' | 'EVENING_PICKUP' | 'EVENING_DROPOFF';
      
      if (routeType === 'MORNING_PICKUP') {
        attendanceType = body.type === 'pickup' ? 'MORNING_PICKUP' : 'MORNING_DROPOFF';
      } else {
        attendanceType = body.type === 'pickup' ? 'EVENING_PICKUP' : 'EVENING_DROPOFF';
      }

      // Create attendance record
      const attendance = await this.prisma.attendance.create({
        data: {
          driverId,
          childId: body.childId,
          date: new Date(), // Add the required date field
          type: attendanceType,
          latitude: body.latitude,
          longitude: body.longitude,
          notes: body.notes || `${body.type} completed`,
          status: body.status || 'completed',
        },
      });

      // Update waypoint status if it exists
      const waypoint = await this.prisma.routeWaypoint.findFirst({
        where: {
          driverId,
          childId: body.childId,
          type: body.type.toUpperCase() as any,
        },
        orderBy: { id: 'desc' },
      });

      if (waypoint) {
        await this.prisma.routeWaypoint.update({
          where: { id: waypoint.id },
          data: { status: 'ARRIVED' },
        });
      }

      return {
        success: true,
        attendance,
        message: `${body.type} attendance marked successfully`,
      };
    } catch (error) {
      console.error('Error marking attendance:', error);
      return {
        success: false,
        message: 'Failed to mark attendance',
        error: error.message,
      };
    }
  }

  // Get driver's assigned cities
  @Get('cities')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getDriverCities(@Req() req: AuthenticatedRequest) {
    const driverId = parseInt(req.user.sub, 10);
    return this.driverService.getDriverCities(driverId);
  }

  // Save or update driver's route cities
  @Post('cities')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async saveDriverCities(
    @Req() req: AuthenticatedRequest,
    @Body() body: { cityIds: number[] },
  ) {
    const driverId = parseInt(req.user.sub, 10);

    if (
      !body.cityIds ||
      !Array.isArray(body.cityIds) ||
      body.cityIds.length < 2
    ) {
      return {
        success: false,
        message: 'Please provide at least 2 cities (start and destination)',
      };
    }

    return this.driverService.saveDriverCities(driverId, body.cityIds);
  }
}
