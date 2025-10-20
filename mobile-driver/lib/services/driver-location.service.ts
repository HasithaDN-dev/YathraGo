import { io, Socket } from 'socket.io-client';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const SOCKET_URL = `${API_URL}/driver-location`;

// Location update interval in milliseconds (10 seconds)
const LOCATION_UPDATE_INTERVAL = 10000;

// Minimum distance change to send update (meters)
const MIN_DISTANCE_CHANGE = 10;

interface LocationServiceConfig {
  driverId: string;
  routeId: string;
  onLocationUpdate?: (location: Location.LocationObject) => void;
  onError?: (error: Error) => void;
  onRideStarted?: () => void;
  onRideEnded?: () => void;
}

/**
 * Driver Location Tracking Service
 * Manages WebSocket connection and real-time location updates
 */
class DriverLocationService {
  private socket: Socket | null = null;
  private locationSubscription: Location.LocationSubscription | null = null;
  private isTracking = false;
  private config: LocationServiceConfig | null = null;
  private lastLocation: Location.LocationObject | null = null;
  private updateTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket connection
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to location tracking server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        reject(error);
      });

      this.socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
        this.config?.onError?.(new Error(error.message || 'Socket error'));
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from location tracking server');
      });

      // Listen for server responses
      this.socket.on('rideStarted', (data) => {
        console.log('🚗 Ride started confirmed:', data);
      });

      this.socket.on('rideEnded', (data) => {
        console.log('🛑 Ride ended confirmed:', data);
      });
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Request location permissions
   */
  async requestLocationPermissions(): Promise<boolean> {
    try {
      // Request foreground permissions
      const { status: foregroundStatus } = 
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        throw new Error('Foreground location permission denied');
      }

      // For background location (optional, for better tracking)
      if (Platform.OS !== 'web') {
        const { status: backgroundStatus } = 
          await Location.requestBackgroundPermissionsAsync();
        
        if (backgroundStatus !== 'granted') {
          console.warn('⚠️ Background location permission denied');
          // Continue anyway with foreground only
        }
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Start tracking and broadcasting location
   */
  async startLocationTracking(config: LocationServiceConfig): Promise<boolean> {
    try {
      if (this.isTracking) {
        console.warn('⚠️ Location tracking already active');
        return false;
      }

      this.config = config;

      // Ensure permissions
      const hasPermission = await this.requestLocationPermissions();
      if (!hasPermission) {
        throw new Error('Location permissions not granted');
      }

      // Ensure socket connection
      if (!this.socket?.connected) {
        await this.connect();
      }

      // Get initial location
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      this.lastLocation = initialLocation;

      // Emit startRide event to server
      this.socket?.emit('startRide', {
        driverId: config.driverId,
        routeId: config.routeId,
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
      });

      // Start watching location changes
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: LOCATION_UPDATE_INTERVAL,
          distanceInterval: MIN_DISTANCE_CHANGE,
        },
        (location) => {
          this.handleLocationUpdate(location);
        }
      );

      this.isTracking = true;
      console.log('📍 Location tracking started');
      config.onRideStarted?.();

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      this.config?.onError?.(error as Error);
      return false;
    }
  }

  /**
   * Handle location updates
   */
  private handleLocationUpdate(location: Location.LocationObject) {
    if (!this.isTracking || !this.socket?.connected || !this.config) {
      return;
    }

    this.lastLocation = location;

    // Send location to server
    this.socket.emit('updateLocation', {
      driverId: this.config.driverId,
      routeId: this.config.routeId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      heading: location.coords.heading,
      speed: location.coords.speed,
      accuracy: location.coords.accuracy,
    });

    // Call callback
    this.config.onLocationUpdate?.(location);

    console.log(
      `📍 Location updated: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`
    );
  }

  /**
   * Stop tracking and broadcasting location
   */
  async stopLocationTracking(): Promise<void> {
    try {
      if (!this.isTracking) {
        console.warn('⚠️ Location tracking not active');
        return;
      }

      // Stop watching location
      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }

      // Clear timer
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
        this.updateTimer = null;
      }

      // Emit endRide event to server
      if (this.socket?.connected && this.config) {
        this.socket.emit('endRide', {
          driverId: this.config.driverId,
          routeId: this.config.routeId,
          latitude: this.lastLocation?.coords.latitude,
          longitude: this.lastLocation?.coords.longitude,
        });
      }

      this.isTracking = false;
      console.log('🛑 Location tracking stopped');
      this.config?.onRideEnded?.();
      this.config = null;
      this.lastLocation = null;
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      throw error;
    }
  }

  /**
   * Get current tracking status
   */
  getTrackingStatus(): {
    isTracking: boolean;
    isConnected: boolean;
    lastLocation: Location.LocationObject | null;
  } {
    return {
      isTracking: this.isTracking,
      isConnected: this.socket?.connected || false,
      lastLocation: this.lastLocation,
    };
  }

  /**
   * Get the last known location
   */
  getLastLocation(): Location.LocationObject | null {
    return this.lastLocation;
  }
}

// Export singleton instance
export const driverLocationService = new DriverLocationService();
