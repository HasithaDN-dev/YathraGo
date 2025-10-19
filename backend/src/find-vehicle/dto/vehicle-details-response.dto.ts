export class VehicleDetailsResponseDto {
  // Driver Information
  driverId: number;
  driverName: string;
  driverPhone: string;
  driverRating: number;
  driverReviewsCount: number;
  driverCompletedRides: number;
  driverProfileImage?: string;

  // Vehicle Information
  vehicleId: number;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleRegistrationNumber: string;
  vehicleColor: string;
  vehicleDescription?: string;
  availableSeats: number;
  airConditioned: boolean;
  assistant: boolean;
  vehicleRating: number;
  vehicleReviewsCount: number;
  vehicleImages?: string[];

  // Route Information
  startCity: string;
  endCity: string;
  routeCities: string[];
  rideType: 'School' | 'Work' | 'Both';

  // Time Information (display only)
  usualStartTime?: string;
  usualEndTime?: string;

  // Distance from customer (if applicable)
  distanceFromPickup?: number;
  distanceFromDrop?: number;
}
