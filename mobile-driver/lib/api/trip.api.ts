import { API_BASE_URL } from '../../config/api';

export interface Trip {
  tripId: number;
  date: string;
  pickUp: string;
  dropOff: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export interface TripHistoryResponse {
  success: boolean;
  driverId: number;
  driverName: string;
  totalTrips: number;
  trips: Trip[];
}

/**
 * Get driver trip history from backend
 * @param driverId - The ID of the driver
 * @returns Promise with trip history data
 */
export const getDriverTripHistory = async (driverId: number): Promise<TripHistoryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/driver/trip-history/${driverId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: 'Failed to fetch trip history' 
      }));
      throw new Error(error.message || `HTTP ${response.status}: Failed to fetch trip history`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching trip history:', error);
    throw error;
  }
};
