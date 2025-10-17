import { API_BASE_URL } from "../../config/api";
import { tokenService } from "../services/token.service";

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
 * Get driver trip history from backend using authenticated session
 * No need to pass driverId - it's extracted from JWT token
 * @returns Promise with trip history data
 */
export const getDriverTripHistory = async (): Promise<TripHistoryResponse> => {
  try {
    const authenticatedFetch = tokenService.createAuthenticatedFetch();
    const response = await authenticatedFetch(
      `${API_BASE_URL}/driver/trip-history`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Failed to fetch trip history",
      }));
      throw new Error(
        error.message || `HTTP ${response.status}: Failed to fetch trip history`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching trip history:", error);
    throw error;
  }
};
