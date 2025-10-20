import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO for starting a ride with location tracking
 */
export class StartRideDto {
  @IsString()
  @IsNotEmpty()
  driverId: string;

  @IsString()
  @IsNotEmpty()
  routeId: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}

/**
 * DTO for ending a ride
 */
export class EndRideDto {
  @IsString()
  @IsNotEmpty()
  driverId: string;

  @IsString()
  @IsNotEmpty()
  routeId: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}

/**
 * DTO for updating driver location during active ride
 */
export class UpdateLocationDto {
  @IsString()
  @IsNotEmpty()
  driverId: string;

  @IsString()
  @IsNotEmpty()
  routeId: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsNumber()
  @IsOptional()
  heading?: number; // Direction in degrees (0-360)

  @IsNumber()
  @IsOptional()
  speed?: number; // Speed in m/s

  @IsNumber()
  @IsOptional()
  accuracy?: number; // GPS accuracy in meters
}

/**
 * DTO for customer subscribing to route location updates
 */
export class SubscribeToRouteDto {
  @IsString()
  @IsNotEmpty()
  routeId: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;
}

/**
 * Response DTO for location updates broadcasted to customers
 */
export class LocationUpdateResponse {
  routeId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: number;
}

/**
 * Response DTO for ride status events
 */
export class RideStatusResponse {
  routeId: string;
  driverId: string;
  status: 'STARTED' | 'ENDED';
  latitude?: number;
  longitude?: number;
  timestamp: number;
  message?: string;
}
