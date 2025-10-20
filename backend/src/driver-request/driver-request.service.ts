import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRequestDto,
  CounterOfferDto,
  RespondRequestDto,
  RequestResponseDto,
  NegotiationHistoryItem,
} from './dto';
import { askStatus } from '@prisma/client';
import * as turf from '@turf/turf';

// Configuration constants
const PRICE_PER_KM_PER_DAY = 15; // Rs. 15 per km per day
const AVERAGE_WORKING_DAYS_PER_MONTH = 26; // Working days in a month

@Injectable()
export class DriverRequestService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new ride request
   */
  async createRequest(dto: CreateRequestDto): Promise<RequestResponseDto> {
    // Get customer info
    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Get profile info (child or staff)
    let profile: any;
    let pickupLat: number;
    let pickupLon: number;
    let dropLat: number;
    let dropLon: number;
    let profileName: string;

    if (dto.profileType === 'child') {
      profile = await this.prisma.child.findUnique({
        where: { child_id: dto.profileId },
      });
      if (!profile) {
        throw new NotFoundException('Child profile not found');
      }
      pickupLat = profile.pickupLatitude ?? 0;
      pickupLon = profile.pickupLongitude ?? 0;
      dropLat = profile.schoolLatitude ?? 0;
      dropLon = profile.schoolLongitude ?? 0;
      profileName = `${profile.childFirstName} ${profile.childLastName}`;
    } else {
      profile = await this.prisma.staff_Passenger.findUnique({
        where: { id: dto.profileId },
      });
      if (!profile) {
        throw new NotFoundException('Staff profile not found');
      }
      pickupLat = profile.pickupLatitude ?? 0;
      pickupLon = profile.pickupLongitude ?? 0;
      dropLat = profile.workLatitude ?? 0;
      dropLon = profile.workLongitude ?? 0;
      profileName = 'Staff Passenger';
    }

    // Get driver info
    const driver = await this.prisma.driver.findUnique({
      where: { driver_id: dto.driverId },
      include: {
        driverCities: true,
        vehicles: true,
      },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (!driver.driverCities) {
      throw new BadRequestException('Driver has no route configured');
    }

    // Calculate estimated distance and get city names
    const cityIds = driver.driverCities.cityIds;
    const distanceInfo = await this.calculateEstimatedDistance(
      pickupLat,
      pickupLon,
      dropLat,
      dropLon,
      cityIds,
    );

    // Calculate estimated price
    const estimatedPrice = this.calculatePrice(distanceInfo.totalDistance);

    // Use offered amount or estimated price
    const initialAmount = dto.offeredAmount || estimatedPrice;

    // Create initial negotiation history
    const negotiationHistory: NegotiationHistoryItem[] = [
      {
        offeredBy: 'customer',
        amount: initialAmount,
        note: dto.customerNote,
        timestamp: new Date().toISOString(),
        action: 'COUNTER',
      },
    ];

    // Create request
    const request = await this.prisma.askDriverRequest.create({
      data: {
        customerID: dto.customerId,
        staffOrChild: dto.profileType,
        staffOrChildID: dto.profileId,
        driverId: dto.driverId,
        estimatedDistance: distanceInfo.totalDistance,
        estimatedPrice: estimatedPrice,
        currentAmount: initialAmount,
        customerNote: dto.customerNote,
        status: askStatus.PENDING,
        nearestPickupCityID: distanceInfo.nearestPickupCityId,
        nearestWorkOrSchoolCityID: distanceInfo.nearestDropCityId,
        nearestPickupCityName: distanceInfo.nearestPickupCityName,
        nearestDropCityName: distanceInfo.nearestDropCityName,
        lastModifiedBy: 'customer',
        negotiationHistory: negotiationHistory as any,
        updatedAt: new Date(),
      },
    });

    return this.formatResponse(
      request,
      customer,
      profile,
      driver,
      dto.profileType,
      profileName,
    );
  }

  /**
   * Get all requests for a customer
   */
  async getCustomerRequests(
    customerId: number,
    status?: askStatus,
  ): Promise<RequestResponseDto[]> {
    const whereClause: any = { customerID: customerId };
    if (status) {
      whereClause.status = status;
    }

    const requests = await this.prisma.askDriverRequest.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
    });

    return Promise.all(
      requests.map(async (request) => {
        const customer = await this.prisma.customer.findUnique({
          where: { customer_id: request.customerID },
        });
        const driver = await this.prisma.driver.findUnique({
          where: { driver_id: request.driverId },
          include: { vehicles: true },
        });
        const profile =
          request.staffOrChild === 'child'
            ? await this.prisma.child.findUnique({
                where: { child_id: request.staffOrChildID },
              })
            : await this.prisma.staff_Passenger.findUnique({
                where: { id: request.staffOrChildID },
              });

        const profileName =
          request.staffOrChild === 'child'
            ? `${(profile as any).childFirstName} ${(profile as any).childLastName}`
            : 'Staff Passenger';

        return this.formatResponse(
          request,
          customer!,
          profile,
          driver!,
          request.staffOrChild as 'child' | 'staff',
          profileName,
        );
      }),
    );
  }

  /**
   * Get all requests for a driver
   */
  async getDriverRequests(
    driverId: number,
    status?: askStatus,
  ): Promise<RequestResponseDto[]> {
    const whereClause: any = { driverId: driverId };
    if (status) {
      whereClause.status = status;
    }

    const requests = await this.prisma.askDriverRequest.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
    });

    return Promise.all(
      requests.map(async (request) => {
        const customer = await this.prisma.customer.findUnique({
          where: { customer_id: request.customerID },
        });
        const driver = await this.prisma.driver.findUnique({
          where: { driver_id: request.driverId },
          include: { vehicles: true },
        });
        const profile =
          request.staffOrChild === 'child'
            ? await this.prisma.child.findUnique({
                where: { child_id: request.staffOrChildID },
              })
            : await this.prisma.staff_Passenger.findUnique({
                where: { id: request.staffOrChildID },
              });

        const profileName =
          request.staffOrChild === 'child'
            ? `${(profile as any).childFirstName} ${(profile as any).childLastName}`
            : 'Staff Passenger';

        return this.formatResponse(
          request,
          customer!,
          profile,
          driver!,
          request.staffOrChild as 'child' | 'staff',
          profileName,
        );
      }),
    );
  }

  /**
   * Customer counter offer
   */
  async customerCounterOffer(
    requestId: number,
    dto: CounterOfferDto,
    customerId: number,
  ): Promise<RequestResponseDto> {
    const request = await this.prisma.askDriverRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.customerID !== customerId) {
      throw new BadRequestException(
        'You are not authorized to modify this request',
      );
    }

    if (
      request.status === askStatus.ACCEPTED ||
      request.status === askStatus.REJECTED ||
      request.status === askStatus.ASSIGNED
    ) {
      throw new BadRequestException('Cannot counter offer on a closed request');
    }

    // Add to negotiation history
    const history =
      (request.negotiationHistory as unknown as NegotiationHistoryItem[]) || [];
    history.push({
      offeredBy: 'customer',
      amount: dto.amount,
      note: dto.note,
      timestamp: new Date().toISOString(),
      action: 'COUNTER',
    });

    const updated = await this.prisma.askDriverRequest.update({
      where: { id: requestId },
      data: {
        currentAmount: dto.amount,
        customerNote: dto.note,
        status: askStatus.CUSTOMER_COUNTER,
        lastModifiedBy: 'customer',
        negotiationHistory: history as any,
      },
    });

    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: updated.customerID },
    });
    const driver = await this.prisma.driver.findUnique({
      where: { driver_id: updated.driverId },
      include: { vehicles: true },
    });
    const profile =
      updated.staffOrChild === 'child'
        ? await this.prisma.child.findUnique({
            where: { child_id: updated.staffOrChildID },
          })
        : await this.prisma.staff_Passenger.findUnique({
            where: { id: updated.staffOrChildID },
          });

    const profileName =
      updated.staffOrChild === 'child'
        ? `${(profile as any).childFirstName} ${(profile as any).childLastName}`
        : 'Staff Passenger';

    return this.formatResponse(
      updated,
      customer!,
      profile,
      driver!,
      updated.staffOrChild as 'child' | 'staff',
      profileName,
    );
  }

  /**
   * Driver respond to request
   */
  async driverRespond(
    requestId: number,
    dto: RespondRequestDto,
    driverId: number,
  ): Promise<RequestResponseDto> {
    const request = await this.prisma.askDriverRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.driverId !== driverId) {
      throw new BadRequestException(
        'You are not authorized to respond to this request',
      );
    }

    if (
      request.status === askStatus.ACCEPTED ||
      request.status === askStatus.REJECTED ||
      request.status === askStatus.ASSIGNED
    ) {
      throw new BadRequestException('Cannot respond to a closed request');
    }

    const history =
      (request.negotiationHistory as unknown as NegotiationHistoryItem[]) || [];

    let newStatus: askStatus;
    let currentAmount = request.currentAmount;

    if (dto.action === 'ACCEPT') {
      newStatus = askStatus.ACCEPTED;
      history.push({
        offeredBy: 'driver',
        amount: request.currentAmount,
        note: dto.note,
        timestamp: new Date().toISOString(),
        action: 'ACCEPT',
      });
    } else if (dto.action === 'REJECT') {
      newStatus = askStatus.REJECTED;
      history.push({
        offeredBy: 'driver',
        amount: request.currentAmount,
        note: dto.note,
        timestamp: new Date().toISOString(),
        action: 'REJECT',
      });
    } else {
      // COUNTER
      if (!dto.amount) {
        throw new BadRequestException('Amount is required for counter offer');
      }
      newStatus = askStatus.DRIVER_COUNTER;
      currentAmount = dto.amount;
      history.push({
        offeredBy: 'driver',
        amount: dto.amount,
        note: dto.note,
        timestamp: new Date().toISOString(),
        action: 'COUNTER',
      });
    }

    const updated = await this.prisma.askDriverRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        currentAmount: currentAmount,
        driverNote: dto.note,
        lastModifiedBy: 'driver',
        negotiationHistory: history as any,
      },
    });

    // If driver accepted, automatically assign to ride table
    if (dto.action === 'ACCEPT') {
      await this.assignRequest(requestId);
    }

    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: updated.customerID },
    });
    const driver = await this.prisma.driver.findUnique({
      where: { driver_id: updated.driverId },
      include: { vehicles: true },
    });
    const profile =
      updated.staffOrChild === 'child'
        ? await this.prisma.child.findUnique({
            where: { child_id: updated.staffOrChildID },
          })
        : await this.prisma.staff_Passenger.findUnique({
            where: { id: updated.staffOrChildID },
          });

    const profileName =
      updated.staffOrChild === 'child'
        ? `${(profile as any).childFirstName} ${(profile as any).childLastName}`
        : 'Staff Passenger';

    return this.formatResponse(
      updated,
      customer!,
      profile,
      driver!,
      updated.staffOrChild as 'child' | 'staff',
      profileName,
    );
  }

  /**
   * Accept the current offer (can be called by either party)
   */
  async acceptRequest(
    requestId: number,
    userId: number,
    userType: 'customer' | 'driver',
  ): Promise<RequestResponseDto> {
    const request = await this.prisma.askDriverRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // Verify authorization
    if (userType === 'customer' && request.customerID !== userId) {
      throw new BadRequestException(
        'You are not authorized to accept this request',
      );
    }
    if (userType === 'driver' && request.driverId !== userId) {
      throw new BadRequestException(
        'You are not authorized to accept this request',
      );
    }

    if (
      request.status === askStatus.ACCEPTED ||
      request.status === askStatus.REJECTED ||
      request.status === askStatus.ASSIGNED
    ) {
      throw new BadRequestException('Request is already closed');
    }

    const history =
      (request.negotiationHistory as unknown as NegotiationHistoryItem[]) || [];
    history.push({
      offeredBy: userType,
      amount: request.currentAmount,
      note: 'Accepted the offer',
      timestamp: new Date().toISOString(),
      action: 'ACCEPT',
    });

    const updated = await this.prisma.askDriverRequest.update({
      where: { id: requestId },
      data: {
        status: askStatus.ACCEPTED,
        lastModifiedBy: userType,
        negotiationHistory: history as any,
      },
    });

    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: updated.customerID },
    });
    const driver = await this.prisma.driver.findUnique({
      where: { driver_id: updated.driverId },
      include: { vehicles: true },
    });
    const profile =
      updated.staffOrChild === 'child'
        ? await this.prisma.child.findUnique({
            where: { child_id: updated.staffOrChildID },
          })
        : await this.prisma.staff_Passenger.findUnique({
            where: { id: updated.staffOrChildID },
          });

    const profileName =
      updated.staffOrChild === 'child'
        ? `${(profile as any).childFirstName} ${(profile as any).childLastName}`
        : 'Staff Passenger';

    // Automatically assign to ChildRideRequest or StaffRideRequest
    await this.assignRequest(requestId);

    return this.formatResponse(
      updated,
      customer!,
      profile,
      driver!,
      updated.staffOrChild as 'child' | 'staff',
      profileName,
    );
  }

  /**
   * Reject request
   */
  async rejectRequest(
    requestId: number,
    userId: number,
    userType: 'customer' | 'driver',
    reason?: string,
  ): Promise<void> {
    const request = await this.prisma.askDriverRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // Verify authorization
    if (userType === 'customer' && request.customerID !== userId) {
      throw new BadRequestException(
        'You are not authorized to reject this request',
      );
    }
    if (userType === 'driver' && request.driverId !== userId) {
      throw new BadRequestException(
        'You are not authorized to reject this request',
      );
    }

    if (
      request.status === askStatus.ACCEPTED ||
      request.status === askStatus.REJECTED ||
      request.status === askStatus.ASSIGNED
    ) {
      throw new BadRequestException('Request is already closed');
    }

    const history =
      (request.negotiationHistory as unknown as NegotiationHistoryItem[]) || [];
    history.push({
      offeredBy: userType,
      amount: request.currentAmount,
      note: reason || 'Rejected',
      timestamp: new Date().toISOString(),
      action: 'REJECT',
    });

    await this.prisma.askDriverRequest.update({
      where: { id: requestId },
      data: {
        status: askStatus.REJECTED,
        lastModifiedBy: userType,
        negotiationHistory: history as any,
      },
    });
  }

  /**
   * Assign accepted request to ChildRideRequest or StaffRideRequest
   */
  async assignRequest(requestId: number): Promise<void> {
    const request = await this.prisma.askDriverRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== askStatus.ACCEPTED) {
      throw new BadRequestException(
        'Request must be accepted before assignment',
      );
    }

    if (request.staffOrChild === 'child') {
      await this.prisma.childRideRequest.create({
        data: {
          childId: request.staffOrChildID,
          driverId: request.driverId,
          Amount: request.currentAmount,
          status: 'Assigned',
          AssignedDate: new Date(),
        },
      });
    } else {
      await this.prisma.staffRideRequest.create({
        data: {
          staffId: request.staffOrChildID,
          driverId: request.driverId,
          Amount: request.currentAmount,
          status: 'Assigned',
          AssignedDate: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    await this.prisma.askDriverRequest.update({
      where: { id: requestId },
      data: { status: askStatus.ASSIGNED },
    });
  }

  /**
   * Calculate estimated distance between pickup and drop using driver's cities
   */
  private async calculateEstimatedDistance(
    pickupLat: number,
    pickupLon: number,
    dropLat: number,
    dropLon: number,
    driverCityIds: number[],
  ): Promise<{
    totalDistance: number;
    nearestPickupCityId: number;
    nearestDropCityId: number;
    nearestPickupCityName: string;
    nearestDropCityName: string;
  }> {
    // Get all driver cities
    const cities = await this.prisma.city.findMany({
      where: { id: { in: driverCityIds } },
    });

    if (cities.length === 0) {
      throw new BadRequestException('Driver has no valid cities');
    }

    const pickupPoint = turf.point([pickupLon, pickupLat]);
    const dropPoint = turf.point([dropLon, dropLat]);

    // Find nearest city from pickup
    let nearestPickupCity = cities[0];
    let minPickupDistance = turf.distance(
      pickupPoint,
      turf.point([nearestPickupCity.longitude, nearestPickupCity.latitude]),
      'kilometers',
    );

    for (const city of cities) {
      const cityPoint = turf.point([city.longitude, city.latitude]);
      const distance = turf.distance(pickupPoint, cityPoint, 'kilometers');
      if (distance < minPickupDistance) {
        minPickupDistance = distance;
        nearestPickupCity = city;
      }
    }

    // Find nearest city from drop
    let nearestDropCity = cities[0];
    let minDropDistance = turf.distance(
      dropPoint,
      turf.point([nearestDropCity.longitude, nearestDropCity.latitude]),
      'kilometers',
    );

    for (const city of cities) {
      const cityPoint = turf.point([city.longitude, city.latitude]);
      const distance = turf.distance(dropPoint, cityPoint, 'kilometers');
      if (distance < minDropDistance) {
        minDropDistance = distance;
        nearestDropCity = city;
      }
    }

    // Calculate distance between the two nearest cities
    const nearestPickupCityPoint = turf.point([
      nearestPickupCity.longitude,
      nearestPickupCity.latitude,
    ]);
    const nearestDropCityPoint = turf.point([
      nearestDropCity.longitude,
      nearestDropCity.latitude,
    ]);
    const betweenCitiesDistance = turf.distance(
      nearestPickupCityPoint,
      nearestDropCityPoint,
      'kilometers',
    );

    // Total distance = pickup to nearest city + between cities + nearest city to drop
    const totalDistance =
      minPickupDistance + betweenCitiesDistance + minDropDistance;

    return {
      totalDistance: Math.round(totalDistance * 100) / 100, // Round to 2 decimal places
      nearestPickupCityId: nearestPickupCity.id,
      nearestDropCityId: nearestDropCity.id,
      nearestPickupCityName: nearestPickupCity.name,
      nearestDropCityName: nearestDropCity.name,
    };
  }

  /**
   * Calculate monthly price based on distance
   */
  private calculatePrice(distanceKm: number): number {
    return Math.round(
      distanceKm * PRICE_PER_KM_PER_DAY * AVERAGE_WORKING_DAYS_PER_MONTH,
    );
  }

  /**
   * Format response DTO
   */
  private formatResponse(
    request: any,
    customer: any,
    profile: any,
    driver: any,
    profileType: 'child' | 'staff',
    profileName: string,
  ): RequestResponseDto {
    const vehicle =
      driver.vehicles && driver.vehicles.length > 0 ? driver.vehicles[0] : null;
    const vehicleInfo = vehicle
      ? `${vehicle.brand} ${vehicle.model} (${vehicle.registrationNumber})`
      : 'Unknown Vehicle';

    return {
      id: request.id,
      customerID: request.customerID,
      customerName: `${customer.firstName} ${customer.lastName}`,
      profileType: profileType,
      profileId: request.staffOrChildID,
      profileName: profileName,
      driverId: request.driverId,
      driverName: driver.name,
      vehicleInfo: vehicleInfo,
      estimatedDistance: request.estimatedDistance,
      estimatedPrice: request.estimatedPrice,
      currentAmount: request.currentAmount,
      status: request.status,
      customerNote: request.customerNote,
      driverNote: request.driverNote,
      lastModifiedBy: request.lastModifiedBy,
      nearestPickupCityName: request.nearestPickupCityName,
      nearestDropCityName: request.nearestDropCityName,
      negotiationHistory:
        (request.negotiationHistory as unknown as NegotiationHistoryItem[]) ||
        [],
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }
}
