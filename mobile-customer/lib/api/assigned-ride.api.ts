// API for fetching assigned ride information
import axios from 'axios';
import { tokenService } from '../services/token.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.8.183:3000';

export interface AssignedDriver {
  id: number;
  name: string;
  phone: string;
  profilePictureUrl: string;
  rating: number;
}

export interface AssignedVehicle {
  id: number;
  registrationNumber: string;
  brand: string;
  model: string;
  type: string;
  color: string;
  seats: number;
  airConditioned: boolean;
}

export interface AssignedRideResponse {
  rideRequestId: number;
  childId?: number;
  staffId?: number;
  driverId: number;
  amount: number | null;
  assignedDate: string | null;
  status: string;
  driver: AssignedDriver;
  vehicle: AssignedVehicle | null;
}

export const assignedRideApi = {
  /**
   * Get assigned ride for a child profile
   */
  getAssignedChildRide: async (childId: number): Promise<AssignedRideResponse | null> => {
    try {
      const token = await tokenService.getValidToken();
      const response = await axios.get(
        `${API_URL}/customer/assigned-ride/child/${childId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.data === null) {
        return null; // No assigned ride found
      }
      console.error('Get assigned child ride error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get assigned ride for staff profile
   */
  getAssignedStaffRide: async (): Promise<AssignedRideResponse | null> => {
    try {
      const token = await tokenService.getValidToken();
      const response = await axios.get(
        `${API_URL}/customer/assigned-ride/staff`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.data === null) {
        return null; // No assigned ride found
      }
      console.error('Get assigned staff ride error:', error.response?.data || error.message);
      throw error;
    }
  },
};
