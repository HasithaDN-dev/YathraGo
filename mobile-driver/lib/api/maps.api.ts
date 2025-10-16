import axios from "axios";
import polyline from "@mapbox/polyline";

const SERVER_BASE = process.env.SERVER_BASE_URL || "http://localhost:3000";

export const fetchOptimizedRoute = async (driverId: number) => {
  const res = await axios.post(
    `${SERVER_BASE}/driver-route/optimize/${driverId}`
  );
  return res.data;
};

export const getLatestRoute = async (driverId: number) => {
  const res = await axios.get(`${SERVER_BASE}/driver-route/${driverId}`);
  return res.data;
};

export const decodeOverviewPolyline = (overviewPolyline: string) => {
  // returns array of [lat, lng]
  return polyline
    .decode(overviewPolyline)
    .map((p) => ({ latitude: p[0], longitude: p[1] }));
};
