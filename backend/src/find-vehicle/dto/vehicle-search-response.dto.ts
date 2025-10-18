export class VehicleSearchResponseDto {
  driverId: number;
  driverName: string;
  driverRating: number;
  driverPhone: string;
  vehicleId: number;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleRegistrationNumber: string;
  vehicleColor: string;
  availableSeats: number;
  airConditioned: boolean;
  assistant: boolean;
  startCity: string;
  endCity: string;
  routeCities: string[];
  distanceFromPickup: number; // in km
  distanceFromDrop: number; // in km
  estimatedPickupTime?: string; // HH:MM format
  estimatedDropTime?: string; // HH:MM format
}
