import { io, Socket } from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const SOCKET_URL = `${API_URL}/driver-location`;

export interface DriverLocation {
  routeId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: number;
}

export interface RideStatus {
  routeId: string;
  driverId: string;
  status: 'STARTED' | 'ENDED';
  latitude?: number;
  longitude?: number;
  timestamp: number;
  message?: string;
}

interface LocationTrackingCallbacks {
  onLocationUpdate?: (location: DriverLocation) => void;
  onRideStarted?: (status: RideStatus) => void;
  onRideEnded?: (status: RideStatus) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

/**
 * Customer Location Tracking Service
 * Subscribes to driver location updates via WebSocket
 */
class CustomerLocationService {
  private socket: Socket | null = null;
  private callbacks: LocationTrackingCallbacks = {};
  private subscribedRoutes = new Set<string>();
  private isConnected = false;

  /**
   * Initialize WebSocket connection
   */
  connect(callbacks: LocationTrackingCallbacks = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.callbacks = callbacks;

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to location tracking server');
        this.isConnected = true;
        this.callbacks.onConnected?.();
        
        // Resubscribe to routes after reconnection
        this.subscribedRoutes.forEach(routeId => {
          this.resubscribeToRoute(routeId);
        });
        
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        reject(error);
      });

      this.socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
        this.callbacks.onError?.(new Error(error.message || 'Socket error'));
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from location tracking server');
        this.isConnected = false;
        this.callbacks.onDisconnected?.();
      });

      // Listen for driver location updates
      this.socket.on('driverLocationUpdated', (data: DriverLocation) => {
        console.log('📍 Driver location updated:', data);
        this.callbacks.onLocationUpdate?.(data);
      });

      // Listen for ride started events
      this.socket.on('rideStarted', (data: RideStatus) => {
        console.log('🚗 Ride started:', data);
        this.callbacks.onRideStarted?.(data);
      });

      // Listen for ride ended events
      this.socket.on('rideEnded', (data: RideStatus) => {
        console.log('🛑 Ride ended:', data);
        this.callbacks.onRideEnded?.(data);
      });
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.subscribedRoutes.clear();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Subscribe to a route to receive driver location updates
   */
  async subscribeToRoute(
    routeId: string,
    customerId: string
  ): Promise<{ success: boolean; isRideActive?: boolean; message?: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to location tracking server'));
        return;
      }

      console.log(`📡 Subscribing to route ${routeId}...`);

      // Send subscription request
      this.socket.emit(
        'subscribeToRoute',
        { routeId, customerId },
        (response: any) => {
          if (response.success) {
            this.subscribedRoutes.add(routeId);
            console.log(`✅ Subscribed to route ${routeId}`);
            resolve({
              success: true,
              isRideActive: response.isRideActive,
              message: response.message,
            });
          } else {
            console.error(`❌ Failed to subscribe to route ${routeId}:`, response.message);
            reject(new Error(response.message || 'Failed to subscribe'));
          }
        }
      );
    });
  }

  /**
   * Resubscribe to a route (used after reconnection)
   */
  private resubscribeToRoute(routeId: string) {
    if (!this.socket?.connected) return;

    console.log(`🔄 Resubscribing to route ${routeId}...`);
    this.socket.emit('subscribeToRoute', { routeId, customerId: 'reconnect' });
  }

  /**
   * Unsubscribe from a route
   */
  async unsubscribeFromRoute(routeId: string, customerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        resolve(); // Already disconnected, nothing to do
        return;
      }

      console.log(`📡 Unsubscribing from route ${routeId}...`);

      this.socket.emit(
        'unsubscribeFromRoute',
        { routeId, customerId },
        (response: any) => {
          if (response.success) {
            this.subscribedRoutes.delete(routeId);
            console.log(`✅ Unsubscribed from route ${routeId}`);
            resolve();
          } else {
            console.error(`❌ Failed to unsubscribe from route ${routeId}`);
            reject(new Error(response.message || 'Failed to unsubscribe'));
          }
        }
      );
    });
  }

  /**
   * Update callbacks
   */
  updateCallbacks(callbacks: LocationTrackingCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    isConnected: boolean;
    subscribedRoutes: string[];
  } {
    return {
      isConnected: this.isConnected,
      subscribedRoutes: Array.from(this.subscribedRoutes),
    };
  }

  /**
   * Check if subscribed to a route
   */
  isSubscribedToRoute(routeId: string): boolean {
    return this.subscribedRoutes.has(routeId);
  }
}

// Export singleton instance
export const customerLocationService = new CustomerLocationService();
