import axios from "axios";
import polyline from "@mapbox/polyline";

const SERVER_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.SERVER_BASE_URL ||
  "http://localhost:3000";

export const fetchOptimizedRoute = async (driverId: number) => {
  const res = await axios.post(
    `${SERVER_BASE}/driver/${driverId}/optimize-route`
  );
  return res.data;
};

export const getLatestRoute = async (driverId: number) => {
  const res = await axios.get(
    `${SERVER_BASE}/driver-route/${driverId}/summary`
  );
  return res.data;
};

export const fetchOptimizedRouteWithGPS = async (
  driverId: number,
  latitude?: number,
  longitude?: number
) => {
  const res = await axios.post(
    `${SERVER_BASE}/driver/${driverId}/optimize-route`,
    {
      latitude,
      longitude,
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
      etaSecs: number;
      legDistanceMeters: number;
    }[];
  };
};

export const decodeOverviewPolyline = (overviewPolyline: string) => {
  const decoded: number[][] = polyline.decode(overviewPolyline);
  return decoded.map((p: number[]) => ({ latitude: p[0], longitude: p[1] }));
};
