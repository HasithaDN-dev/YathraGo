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
// { userId: string, phone: string, userType: UserType, isVerified: boolean }
interface AuthenticatedRequest extends Request {
  user: {
    userId: string; // This is payload.sub (driver_id or customer_id as string)
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
    };

    return this.driverService.completeDriverRegistration(
      phone,
      completeRegistrationData,
    );
  }

  // --- EXISTING PROFILE MANAGEMENT ENDPOINTS (from your provided driver.service.ts) ---
  // Get driver profile by driver ID - NO JWT REQUIRED
  @Get('profile/:driverId')
  @HttpCode(HttpStatus.OK)
  async getDriverProfile(@Param('driverId') driverId: string) {
    return this.driverService.getDriverProfile(driverId);
  }

  // @UseGuards(JwtAuthGuard)
  // @Put('profile')
  // @HttpCode(HttpStatus.OK)
  // async updateDriverProfile(@Req() req: AuthenticatedRequest, @Body() profileData: UpdateDriverProfileDto) {
  //   const driverId = req.user.userId;
  //   return this.driverService.updateDriverProfile(driverId, profileData);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Post('documents')
  // @HttpCode(HttpStatus.OK)
  // async uploadDriverDocuments(@Req() req: AuthenticatedRequest, @Body() documentsData: UploadDocumentsDto) {
  //   const driverId = req.user.userId;
  //   return this.driverService.uploadDriverDocuments(driverId, documentsData);
  // }

  // --- NEW ENDPOINT TO GET DRIVER TRIP HISTORY (FILTERED BY DRIVER ID) ---
  // NO JWT REQUIRED - Just pass driver ID in URL
  @Get('trip-history/:driverId')
  @HttpCode(HttpStatus.OK)
  async getDriverTripHistory(@Param('driverId') driverId: string) {
    return this.driverService.getDriverTripHistory(driverId);
  }
  // Endpoint to fetch driver details for hardcoded driverId (for frontend welcome message)
  @Get('details')
  async getDriverDetails() {
    // Hardcoded driverId for demo (updated to 2)
    const driverId = 2;
    return this.driverService.getDriverDetailsById(driverId);
  }

  // --- Minimal route optimization endpoint ---
  @Post(':driverId/optimize-route')
  @HttpCode(HttpStatus.OK)
  async optimizeRoute(
    @Param('driverId', ParseIntPipe) driverId: number,
    @Body() body: { latitude?: number; longitude?: number },
  ) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return { error: 'Server maps key not configured' };
    }

    // 1) Load assigned children with confirmed coordinates
    const requests = await this.prisma.childRideRequest.findMany({
      where: { driverId, status: 'Assigned' },
      include: {
        child: {
          select: {
            child_id: true,
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
    }> = [];
    for (const r of requests) {
      const c = r.child;
      if (c.pickupLatitude != null && c.pickupLongitude != null) {
        stops.push({
          lat: c.pickupLatitude,
          lng: c.pickupLongitude,
          type: 'pickup',
          childId: c.child_id,
          address: c.pickUpAddress,
        });
      }
      if (c.schoolLatitude != null && c.schoolLongitude != null) {
        stops.push({
          lat: c.schoolLatitude,
          lng: c.schoolLongitude,
          type: 'dropoff',
          childId: c.child_id,
          address: c.school ?? '',
        });
      }
    }
    if (stops.length === 0) {
      return {
        degraded: true,
        message: 'No assigned stops',
        stops: [],
        totalDistanceMeters: 0,
        totalDurationSecs: 0,
        polyline: null,
      };
    }

    // 2) Build Distance Matrix (origins: origin + all stops; destinations: all stops)
    const makeLoc = (p: { lat: number; lng: number }) => `${p.lat},${p.lng}`;
    const dmOrigins: string[] = [];
    const points = stops.map((s) => ({ lat: s.lat, lng: s.lng }));
    if (origin) dmOrigins.push(makeLoc(origin));
    points.forEach((p) => dmOrigins.push(makeLoc(p)));
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
      const rows = res.data?.rows || [];
      const durations: number[][] = rows.map((row: any) =>
        row.elements.map((e: any) => e?.duration?.value ?? 0),
      );
      const distances: number[][] = rows.map((row: any) =>
        row.elements.map((e: any) => e?.distance?.value ?? 0),
      );
      matrix = { durations, distances };
    } catch (e) {
      degraded = true; // fallback later
    }

    // 3) Greedy constrained order: pickup before dropoff, optional capacity
    const driverVehicle = await this.prisma.vehicle.findFirst({
      where: { driverId },
    });
    const capacity = driverVehicle?.no_of_seats ?? null; // null means ignore
    type Stop = (typeof stops)[number];
    const startRowIndex = origin ? 0 : 1;
    const ordered = computeGreedyOrder(stops, matrix, capacity, startRowIndex);

    // 4) Compute ETAs and cumulative distances
    let totalDurationSecs = 0;
    let totalDistanceMeters = 0;
    const now = Math.floor(Date.now() / 1000);
    const stopsOut: Array<{
      lat: number;
      lng: number;
      type: 'pickup' | 'dropoff';
      childId: number;
      address: string;
      etaSecs: number;
      legDistanceMeters: number;
    }> = [];
    let prevIndexForMatrix = origin ? 0 : 1 + stops.indexOf(ordered[0]);
    for (let i = 0; i < ordered.length; i++) {
      const s = ordered[i];
      let legDuration = 0;
      let legDistance = 0;
      if (matrix) {
        const destIdx = stops.indexOf(s);
        legDuration = matrix.durations[prevIndexForMatrix]?.[destIdx] ?? 0;
        legDistance = matrix.distances[prevIndexForMatrix]?.[destIdx] ?? 0;
        prevIndexForMatrix = (origin ? 1 : 1) + destIdx;
      }
      totalDurationSecs += legDuration;
      totalDistanceMeters += legDistance;
      stopsOut.push({
        ...s,
        etaSecs: now + totalDurationSecs,
        legDistanceMeters: legDistance,
      });
    }

    // 5) Fetch Directions polyline for ordered path
    let polyline: string | null = null;
    try {
      const originStr = origin
        ? `${origin.lat},${origin.lng}`
        : `${ordered[0].lat},${ordered[0].lng}`;
      const destinationStr = `${ordered[ordered.length - 1].lat},${ordered[ordered.length - 1].lng}`;
      const waypointStr = ordered
        .slice(0, ordered.length - 1)
        .map((s) => `${s.lat},${s.lng}`)
        .join('|');
      const params = new URLSearchParams();
      params.append('origin', originStr);
      params.append('destination', destinationStr);
      if (ordered.length > 1) params.append('waypoints', waypointStr);
      params.append('key', apiKey);
      const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`;
      const res = await axios.get(url, { timeout: 15000 });
      polyline = res.data?.routes?.[0]?.overview_polyline?.points ?? null;
    } catch (e) {
      // keep degraded flag
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
}
