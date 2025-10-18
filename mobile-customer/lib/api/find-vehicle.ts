import { API_BASE_URL } from '../../config/api';

export interface VehicleSearchParams {
  customerId: number;
  profileType?: 'child' | 'staff';
  profileId?: number;
}

export interface VehicleSearchResult {
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
  distanceFromPickup: number;
  distanceFromDrop: number;
  estimatedPickupTime?: string;
  estimatedDropTime?: string;
}

export interface CustomerProfile {
  children: {
    child_id: number;
    childFirstName: string;
    childLastName: string;
    school: string;
    pickUpAddress: string;
    pickupLatitude: number | null;
    pickupLongitude: number | null;
    schoolLatitude: number | null;
    schoolLongitude: number | null;
  }[];
  staff: {
    id: number;
    workLocation: string;
    workAddress: string;
    pickUpLocation: string;
    pickupAddress: string;
    pickupLatitude: number | null;
    pickupLongitude: number | null;
    workLatitude: number | null;
    workLongitude: number | null;
  } | null;
}

export const findVehicleApi = {
  searchVehicles: async (params: VehicleSearchParams): Promise<VehicleSearchResult[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('customerId', params.customerId.toString());
    
    if (params.profileType) {
      queryParams.append('profileType', params.profileType);
    }
    if (params.profileId) {
      queryParams.append('profileId', params.profileId.toString());
    }

    const response = await fetch(`${API_BASE_URL}/find-vehicle/search?${queryParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search vehicles');
    }
    
    return response.json();
  },

  getCustomerProfiles: async (customerId: number): Promise<CustomerProfile> => {
    const response = await fetch(`${API_BASE_URL}/find-vehicle/profiles?customerId=${customerId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch customer profiles');
    }
    
    return response.json();
  },
};
