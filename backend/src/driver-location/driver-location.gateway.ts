import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UseGuards, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { DriverLocationService } from './driver-location.service';
import {
  StartRideDto,
  EndRideDto,
  UpdateLocationDto,
  SubscribeToRouteDto,
  LocationUpdateResponse,
  RideStatusResponse,
} from './dto';

/**
 * WebSocket Gateway for real-time driver location tracking
 *
 * Events:
 * - startRide: Driver starts a ride (begins location sharing)
 * - endRide: Driver ends a ride (stops location sharing)
 * - updateLocation: Driver sends location update (only broadcasted if ride is active)
 * - subscribeToRoute: Customer subscribes to receive location updates for a route
 * - unsubscribeFromRoute: Customer unsubscribes from route updates
 *
 * Broadcasts:
 * - rideStarted: Notifies customers that driver has started the ride
 * - rideEnded: Notifies customers that driver has ended the ride
 * - driverLocationUpdated: Real-time location updates sent to subscribed customers
 */
@WebSocketGateway({
  cors: {
    origin: '*', // In production, specify your frontend domains
    credentials: true,
  },
  namespace: '/driver-location',
})
export class DriverLocationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DriverLocationGateway.name);

  // Track socket to user mapping
  private socketToUser = new Map<
    string,
    { type: 'driver' | 'customer'; id: string }
  >();

  constructor(private readonly locationService: DriverLocationService) {}

  afterInit(server: Server) {
    this.logger.log(
      'WebSocket Gateway initialized for driver location tracking',
    );

    // Setup periodic cleanup of stale rides (every 30 minutes)
    setInterval(
      () => {
        const cleaned = this.locationService.cleanupStaleRides();
        if (cleaned > 0) {
          this.logger.log(`Cleaned up ${cleaned} stale rides`);
        }
      },
      30 * 60 * 1000,
    );
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const user = this.socketToUser.get(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);

    // Clean up subscriptions if it was a customer
    if (user?.type === 'customer') {
      // Unsubscribe from all routes (implementation depends on how you track subscriptions per socket)
      // For now, we rely on the service cleanup
    }

    this.socketToUser.delete(client.id);
  }

  /**
   * Driver starts a ride
   * This marks the route as active and location updates will be broadcasted
   */
  @SubscribeMessage('startRide')
  async handleStartRide(
    @MessageBody(new ValidationPipe({ transform: true })) data: StartRideDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(
        `Start ride request: Driver ${data.driverId}, Route ${data.routeId}`,
      );

      // Track this socket as a driver
      this.socketToUser.set(client.id, { type: 'driver', id: data.driverId });

      // Mark ride as started in the service
      const result = await this.locationService.startRide(
        data.driverId,
        data.routeId,
        data.latitude,
        data.longitude,
      );

      if (!result.success) {
        client.emit('error', { message: result.message });
        return { success: false, message: result.message };
      }

      // Have the driver join their route room
      client.join(data.routeId);

      // Broadcast to all customers subscribed to this route
      const statusResponse: RideStatusResponse = {
        routeId: data.routeId,
        driverId: data.driverId,
        status: 'STARTED',
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: Date.now(),
        message: 'Driver has started the ride',
      };

      this.server.to(data.routeId).emit('rideStarted', statusResponse);

      this.logger.log(`Ride started broadcast sent for route ${data.routeId}`);

      return { success: true, message: 'Ride started successfully' };
    } catch (error) {
      this.logger.error('Error in handleStartRide:', error);
      return { success: false, message: 'Failed to start ride' };
    }
  }

  /**
   * Driver ends a ride
   * This marks the route as inactive and stops location broadcasting
   */
  @SubscribeMessage('endRide')
  async handleEndRide(
    @MessageBody(new ValidationPipe({ transform: true })) data: EndRideDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(
        `End ride request: Driver ${data.driverId}, Route ${data.routeId}`,
      );

      const result = await this.locationService.endRide(
        data.driverId,
        data.routeId,
      );

      if (!result.success) {
        client.emit('error', { message: result.message });
        return { success: false, message: result.message };
      }

      // Broadcast to all customers
      const statusResponse: RideStatusResponse = {
        routeId: data.routeId,
        driverId: data.driverId,
        status: 'ENDED',
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: Date.now(),
        message: 'Driver has ended the ride',
      };

      this.server.to(data.routeId).emit('rideEnded', statusResponse);

      // Remove driver from room
      client.leave(data.routeId);

      this.logger.log(`Ride ended broadcast sent for route ${data.routeId}`);

      return { success: true, message: 'Ride ended successfully' };
    } catch (error) {
      this.logger.error('Error in handleEndRide:', error);
      return { success: false, message: 'Failed to end ride' };
    }
  }

  /**
   * Driver sends location update
   * Only broadcasted if the ride is active (gatekeeper check)
   */
  @SubscribeMessage('updateLocation')
  async handleLocationUpdate(
    @MessageBody(new ValidationPipe({ transform: true }))
    data: UpdateLocationDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // THE GATEKEEPER CHECK: Only broadcast if ride is active
      const { shouldBroadcast, activeRide } =
        this.locationService.updateLocation(
          data.driverId,
          data.routeId,
          data.latitude,
          data.longitude,
        );

      if (!shouldBroadcast) {
        // Silently ignore - ride is not active
        return { success: false, message: 'Ride is not active' };
      }

      // Broadcast location to all customers in the route room
      const locationResponse: LocationUpdateResponse = {
        routeId: data.routeId,
        driverId: data.driverId,
        latitude: data.latitude,
        longitude: data.longitude,
        heading: data.heading,
        speed: data.speed,
        accuracy: data.accuracy,
        timestamp: Date.now(),
      };

      this.server
        .to(data.routeId)
        .emit('driverLocationUpdated', locationResponse);

      return { success: true };
    } catch (error) {
      this.logger.error('Error in handleLocationUpdate:', error);
      return { success: false, message: 'Failed to update location' };
    }
  }

  /**
   * Customer subscribes to a route
   * They will receive all location updates for this route
   */
  @SubscribeMessage('subscribeToRoute')
  async handleSubscribeToRoute(
    @MessageBody(new ValidationPipe({ transform: true }))
    data: SubscribeToRouteDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(
        `Customer ${data.customerId} subscribing to route ${data.routeId}`,
      );

      // Track this socket as a customer
      this.socketToUser.set(client.id, {
        type: 'customer',
        id: data.customerId,
      });

      // Add customer to the route room
      client.join(data.routeId);

      // Track subscription in service
      this.locationService.subscribeToRoute(data.routeId, data.customerId);

      // Send current location if ride is active
      const activeRide = this.locationService.getActiveRide(data.routeId);
      if (activeRide) {
        const currentLocation: LocationUpdateResponse = {
          routeId: data.routeId,
          driverId: activeRide.driverId,
          latitude: activeRide.latitude,
          longitude: activeRide.longitude,
          timestamp: Date.now(),
        };

        client.emit('driverLocationUpdated', currentLocation);
        this.logger.log(`Sent current location to customer ${data.customerId}`);
      }

      return {
        success: true,
        message: 'Subscribed to route updates',
        isRideActive: !!activeRide,
      };
    } catch (error) {
      this.logger.error('Error in handleSubscribeToRoute:', error);
      return { success: false, message: 'Failed to subscribe to route' };
    }
  }

  /**
   * Customer unsubscribes from a route
   */
  @SubscribeMessage('unsubscribeFromRoute')
  async handleUnsubscribeFromRoute(
    @MessageBody() data: { routeId: string; customerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(
        `Customer ${data.customerId} unsubscribing from route ${data.routeId}`,
      );

      // Remove customer from the route room
      client.leave(data.routeId);

      // Remove subscription from service
      this.locationService.unsubscribeFromRoute(data.routeId, data.customerId);

      return { success: true, message: 'Unsubscribed from route updates' };
    } catch (error) {
      this.logger.error('Error in handleUnsubscribeFromRoute:', error);
      return { success: false, message: 'Failed to unsubscribe from route' };
    }
  }

  /**
   * Get active rides (for debugging/admin purposes)
   */
  @SubscribeMessage('getActiveRides')
  handleGetActiveRides() {
    const activeRides = this.locationService.getAllActiveRides();
    return { success: true, data: activeRides };
  }
}
