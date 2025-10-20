import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const BACKGROUND_LOCATION_TASK = "background-location-task";

export interface StudentDestination {
  childId: number;
  childName: string;
  lat: number;
  lng: number;
  type: "pickup" | "dropoff";
  address: string;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // NotificationBehavior requires these properties depending on SDK/TS definitions
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  } as any),
});

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Define the background location task
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Background location task error:", error);
    return;
  }

  if (data) {
  // TaskManager provides a data object with a locations array; avoid relying on exact expo-location types here
  const { locations } = data as { locations: any[] };
    const location = locations[0];

    if (!location) return;

    try {
      // Get the current destination from storage (set by the navigation screen)
      const destinationJson = await getStoredDestination();
      if (!destinationJson) return;

      const destination: StudentDestination = JSON.parse(destinationJson);

      // Calculate distance to destination
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        destination.lat,
        destination.lng
      );

      console.log(`Background location: distance to destination: ${distance}m`);

      // If within 100 meters, send notification
      if (distance <= 100) {
        await sendArrivalNotification(destination);
        // Clear the destination so we don't send duplicate notifications
        await clearStoredDestination();
      }
    } catch (err) {
      console.error("Error processing background location:", err);
    }
  }
});

// Storage helpers (using a simple in-memory approach for now, can be upgraded to AsyncStorage)
let currentDestination: string | null = null;

async function getStoredDestination(): Promise<string | null> {
  return currentDestination;
}

async function setStoredDestination(
  destination: StudentDestination
): Promise<void> {
  currentDestination = JSON.stringify(destination);
}

async function clearStoredDestination(): Promise<void> {
  currentDestination = null;
}

async function sendArrivalNotification(
  destination: StudentDestination
): Promise<void> {
  const title =
    destination.type === "pickup"
      ? "📍 Pickup Location Reached"
      : "📍 Drop-off Location Reached";
  const body = `You've arrived at ${destination.childName}'s ${destination.type} location. Tap to mark attendance.`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: {
        destination,
        screen: "navigation",
      },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      vibrate: [0, 250, 250, 250],
      ...(Platform.OS === "android" && { channelId: "location-tracking" }),
    },
    trigger: null, // Send immediately
  });

  console.log("Arrival notification sent for:", destination.childName);
}

export const backgroundLocationService = {
  /**
   * Request necessary permissions for background location tracking
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Request foreground permissions first
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== "granted") {
        console.log("Foreground location permission denied");
        return false;
      }

      // Request background permissions
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== "granted") {
        console.log("Background location permission denied");
        return false;
      }

      // Request notification permissions
      const { status: notificationStatus } =
        await Notifications.requestPermissionsAsync();
      if (notificationStatus !== "granted") {
        console.log("Notification permission denied");
        return false;
      }

      console.log("All permissions granted for background tracking");
      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  },

  /**
   * Start background location tracking for a specific destination
   */
  async startTracking(destination: StudentDestination): Promise<boolean> {
    try {
      // Check if task is already running
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_LOCATION_TASK
      );
      if (isRegistered) {
        console.log("Background location task already running");
      }

      // Store the destination
      await setStoredDestination(destination);

      // Start background location updates
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Or when moved 10 meters
        foregroundService: {
          notificationTitle: "YathraGo Driver",
          notificationBody: `Navigating to ${destination.childName}'s ${destination.type} location`,
          notificationColor: "#143373",
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });

      console.log("Background location tracking started");
      return true;
    } catch (error) {
      console.error("Error starting background location tracking:", error);
      return false;
    }
  },

  /**
   * Stop background location tracking
   */
  async stopTracking(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_LOCATION_TASK
      );
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        await clearStoredDestination();
        console.log("Background location tracking stopped");
      }
    } catch (error) {
      console.error("Error stopping background location tracking:", error);
    }
  },

  /**
   * Check if background tracking is currently active
   */
  async isTrackingActive(): Promise<boolean> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_LOCATION_TASK
      );
      return isRegistered;
    } catch (error) {
      console.error("Error checking tracking status:", error);
      return false;
    }
  },

  /**
   * Update the current destination while tracking is active
   */
  async updateDestination(destination: StudentDestination): Promise<void> {
    await setStoredDestination(destination);
    console.log("Destination updated:", destination);
  },

  /**
   * Setup notification response handler
   */
  setupNotificationHandler(
    onNotificationTap: (destination: StudentDestination) => void
  ): void {
    // Handle notification tap
    Notifications.addNotificationResponseReceivedListener((response) => {
      const destination = response.notification.request.content.data
        .destination as StudentDestination;
      if (destination) {
        onNotificationTap(destination);
      }
    });
  },

  /**
   * Check proximity manually (for foreground checking)
   */
  async checkProximity(
    currentLat: number,
    currentLng: number,
    destinationLat: number,
    destinationLng: number
  ): Promise<{ isNear: boolean; distance: number }> {
    const distance = calculateDistance(
      currentLat,
      currentLng,
      destinationLat,
      destinationLng
    );
    return {
      isNear: distance <= 100,
      distance,
    };
  },
};
