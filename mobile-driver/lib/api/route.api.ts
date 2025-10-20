// lib/api/route.api.ts
import { API_BASE_URL } from "@/config/api";
import { tokenService } from "../services/token.service";

export interface RouteStop {
  stopId: number;
  childId: number;
  childName: string;
  childImage: string | null;
  type: "PICKUP" | "DROPOFF";
  address: string;
  latitude: number;
  longitude: number;
  etaSecs: number;
  legDistanceMeters: number;
  cumulativeDistanceMeters: number;
  status: "PENDING" | "ARRIVED" | "COMPLETED" | "SKIPPED";
  order: number;
}

export interface DailyRoute {
  success: boolean;
  route: {
    id: number;
    driverId: number;
    date: string;
    routeType: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    totalDistanceMeters: number | null;
    totalDurationSecs: number | null;
    optimizedPolyline: string | null;
  };
  stops: RouteStop[];
}

export const routeApi = {
  /**
   * Fetch today's optimized route
   */
  async getTodaysRoute(
    routeType: "MORNING_PICKUP" | "AFTERNOON_DROPOFF" = "MORNING_PICKUP",
    latitude?: number,
    longitude?: number
  ): Promise<DailyRoute> {
    const authenticatedFetch = tokenService.createAuthenticatedFetch();

    const response = await authenticatedFetch(
      `${API_BASE_URL}/driver/route/today`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          routeType,
          latitude,
          longitude,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch route");
    }

    return response.json();
  },

  /**
   * Mark a stop as completed
   */
  async markStopCompleted(
    stopId: number,
    latitude?: number,
    longitude?: number,
    notes?: string
  ): Promise<{
    success: boolean;
    remainingStops: number;
    routeCompleted: boolean;
  }> {
    const authenticatedFetch = tokenService.createAuthenticatedFetch();

    const response = await authenticatedFetch(
      `${API_BASE_URL}/driver/route/stop/${stopId}/complete`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude,
          longitude,
          notes,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to mark stop completed");
    }

    return response.json();
  },

  /**
   * Get current route status
   */
  async getCurrentRouteStatus(): Promise<{
    success: boolean;
    routes: any[];
  }> {
    const authenticatedFetch = tokenService.createAuthenticatedFetch();

    const response = await authenticatedFetch(
      `${API_BASE_URL}/driver/route/status`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch route status");
    }

    return response.json();
  },

  /**
   * Get session availability (morning and evening)
   */
  async getSessionAvailability(): Promise<{
    success: boolean;
    morningSession: {
      available: boolean;
      status: string;
      completed: boolean;
    };
    eveningSession: {
      available: boolean;
      status: string;
      completed: boolean;
    };
  }> {
    const authenticatedFetch = tokenService.createAuthenticatedFetch();

    const response = await authenticatedFetch(
      `${API_BASE_URL}/driver/route/session-availability`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch session availability");
    }

    return response.json();
  },
};
