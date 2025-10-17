import { API_BASE_URL } from "../../config/api";

export interface RouteWaypoint {
  waypointId: number;
  order: number;
  type: "PICKUP" | "DROPOFF";
  childId: number;
  childName: string;
  pickupAddress: string;
  school: string;
  lat: number;
  lng: number;
  address?: string;
  eta?: string;
  distance?: number;
  isCompleted: boolean;
}

export interface TodayRoute {
  routeId: number;
  driverId: number;
  date: string;
  waypoints: RouteWaypoint[];
  totalStops: number;
  completedStops: number;
}

export interface AttendanceData {
  driverId: number;
  childId: number;
  waypointId?: number;
  type: "pickup" | "dropoff";
  latitude?: number;
  longitude?: number;
  notes?: string;
  tripId?: number;
}

// Get today's route for driver
export async function getTodayRoute(
  driverId: number
): Promise<TodayRoute | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/driver-route/today/${driverId}`
    );
    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching today route:", error);
    return null;
  }
}

// Mark attendance for a waypoint
export async function markAttendance(
  attendanceData: AttendanceData
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attendanceData),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Error marking attendance:", error);
    return false;
  }
}

// Get attendance history for driver
export async function getAttendanceHistory(driverId: number, date?: string) {
  try {
    const url = date
      ? `${API_BASE_URL}/attendance/history/${driverId}?date=${date}`
      : `${API_BASE_URL}/attendance/history/${driverId}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    return [];
  }
}
