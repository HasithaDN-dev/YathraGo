import axios from "axios";
import polyline from "@mapbox/polyline";
import { tokenService } from "../services/token.service";

const SERVER_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.SERVER_BASE_URL ||
  "http://localhost:3000";

/**
 * Fetch optimized route using authenticated session
 * No need to pass driverId - it's extracted from JWT token
 */
export const fetchOptimizedRoute = async () => {
  const token = await tokenService.getToken();
  if (!token) {
    throw new Error("No authentication token available");
  }

  const res = await axios.post(
    `${SERVER_BASE}/driver/optimize-route`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/**
 * Get latest route summary using authenticated session
 * Note: This endpoint may need to be updated on the backend as well
 */
export const getLatestRoute = async (driverId: number) => {
  const token = await tokenService.getToken();
  if (!token) {
    throw new Error("No authentication token available");
  }

  const res = await axios.get(
    `${SERVER_BASE}/driver-route/${driverId}/summary`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/**
 * Fetch optimized route with GPS coordinates using authenticated session
 * No need to pass driverId - it's extracted from JWT token
 */
export const fetchOptimizedRouteWithGPS = async (
  latitude?: number,
  longitude?: number
) => {
  const token = await tokenService.getToken();
  if (!token) {
    throw new Error("No authentication token available");
  }

  const res = await axios.post(
    `${SERVER_BASE}/driver/optimize-route`,
    {
      latitude,
      longitude,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data as {
    degraded: boolean;
    totalDistanceMeters: number;
    totalDurationSecs: number;
    polyline: string | null;
    stops: {
      lat: number;
      lng: number;
      type: "pickup" | "dropoff";
      childId: number;
      address: string;
      childName: string;
      etaSecs: number;
      legDistanceMeters: number;
    }[];
  };
};

export const decodeOverviewPolyline = (overviewPolyline: string) => {
  const decoded: number[][] = polyline.decode(overviewPolyline);
  return decoded.map((p: number[]) => ({ latitude: p[0], longitude: p[1] }));
};
