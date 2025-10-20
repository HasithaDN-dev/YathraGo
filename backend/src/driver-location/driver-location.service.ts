import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service to manage active rides and location tracking state
 * This service acts as the "gatekeeper" for location broadcasting
 */
@Injectable()
export class DriverLocationService {
  private readonly logger = new Logger(DriverLocationService.name);

  // Track active rides: Map<routeId, { driverId, startTime, lastUpdate }>
  private activeRides = new Map<
    string,
    {
      driverId: string;
      startTime: Date;
      lastUpdate: Date;
      latitude: number;
      longitude: number;
    }
  >();

  // Track which customers are subscribed to which routes
  // Map<routeId, Set<customerId>>
  private routeSubscriptions = new Map<string, Set<string>>();

  constructor(private prisma: PrismaService) {}

  /**
   * Mark a ride as started
   */
  async startRide(
    driverId: string,
    routeId: string,
    latitude: number,
    longitude: number,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check if ride is already active
      if (this.activeRides.has(routeId)) {
        return {
          success: false,
          message: 'Ride is already active for this route',
        };
      }

      // Verify driver exists in database
      const driver = await this.prisma.driver.findUnique({
        where: { driver_id: parseInt(driverId) },
      });

      if (!driver) {
        return {
          success: false,
          message: 'Driver not found',
        };
      }

      // Add to active rides
      this.activeRides.set(routeId, {
        driverId,
        startTime: new Date(),
        lastUpdate: new Date(),
        latitude,
        longitude,
      });

      this.logger.log(`Ride started: Driver ${driverId}, Route ${routeId}`);

      return {
        success: true,
        message: 'Ride started successfully',
      };
    } catch (error) {
      this.logger.error('Error starting ride:', error);
      return {
        success: false,
        message: 'Failed to start ride',
      };
    }
  }

  /**
   * Mark a ride as ended
   */
  async endRide(
    driverId: string,
    routeId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const activeRide = this.activeRides.get(routeId);

      if (!activeRide) {
        return {
          success: false,
          message: 'No active ride found for this route',
        };
      }

      if (activeRide.driverId !== driverId) {
        return {
          success: false,
          message: 'Driver mismatch for this route',
        };
      }

      // Remove from active rides
      this.activeRides.delete(routeId);

      this.logger.log(`Ride ended: Driver ${driverId}, Route ${routeId}`);

      return {
        success: true,
        message: 'Ride ended successfully',
      };
    } catch (error) {
      this.logger.error('Error ending ride:', error);
      return {
        success: false,
        message: 'Failed to end ride',
      };
    }
  }

  /**
   * Update driver location and return whether it should be broadcasted
   */
  updateLocation(
    driverId: string,
    routeId: string,
    latitude: number,
    longitude: number,
  ): { shouldBroadcast: boolean; activeRide?: any } {
    const activeRide = this.activeRides.get(routeId);

    // Only broadcast if ride is active and driver matches
    if (!activeRide || activeRide.driverId !== driverId) {
      return { shouldBroadcast: false };
    }

    // Update the location and timestamp
    activeRide.latitude = latitude;
    activeRide.longitude = longitude;
    activeRide.lastUpdate = new Date();

    return { shouldBroadcast: true, activeRide };
  }

  /**
   * Check if a ride is active
   */
  isRideActive(routeId: string): boolean {
    return this.activeRides.has(routeId);
  }

  /**
   * Get active ride information
   */
  getActiveRide(routeId: string) {
    return this.activeRides.get(routeId);
  }

  /**
   * Get all active rides
   */
  getAllActiveRides() {
    return Array.from(this.activeRides.entries()).map(([routeId, data]) => ({
      routeId,
      ...data,
    }));
  }

  /**
   * Subscribe a customer to route updates
   */
  subscribeToRoute(routeId: string, customerId: string): void {
    if (!this.routeSubscriptions.has(routeId)) {
      this.routeSubscriptions.set(routeId, new Set());
    }

    this.routeSubscriptions.get(routeId)!.add(customerId);
    this.logger.log(`Customer ${customerId} subscribed to route ${routeId}`);
  }

  /**
   * Unsubscribe a customer from route updates
   */
  unsubscribeFromRoute(routeId: string, customerId: string): void {
    const subscribers = this.routeSubscriptions.get(routeId);
    if (subscribers) {
      subscribers.delete(customerId);
      this.logger.log(
        `Customer ${customerId} unsubscribed from route ${routeId}`,
      );

      // Clean up empty subscription sets
      if (subscribers.size === 0) {
        this.routeSubscriptions.delete(routeId);
      }
    }
  }

  /**
   * Get subscribers for a route
   */
  getRouteSubscribers(routeId: string): string[] {
    const subscribers = this.routeSubscriptions.get(routeId);
    return subscribers ? Array.from(subscribers) : [];
  }

  /**
   * Clean up stale rides (rides that haven't updated in over 1 hour)
   */
  cleanupStaleRides(): number {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let cleaned = 0;

    for (const [routeId, ride] of this.activeRides.entries()) {
      if (ride.lastUpdate < oneHourAgo) {
        this.activeRides.delete(routeId);
        cleaned++;
        this.logger.warn(`Cleaned up stale ride for route ${routeId}`);
      }
    }

    return cleaned;
  }
}
