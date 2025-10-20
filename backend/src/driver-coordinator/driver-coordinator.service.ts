import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DriverCoordinatorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get statistics for driver coordinator dashboard
   */
  async getStatistics() {
    // Get pending driver verifications
    const pendingVerifications = await this.prisma.driver.count({
      where: {
        OR: [
          { status: 'PENDING' },
          { status: 'OTP_VERIFIED' },
        ],
      },
    });

    // Get active drivers
    const activeDrivers = await this.prisma.driver.count({
      where: {
        status: 'ACTIVE',
      },
    });

    // Get recent safety alerts (last 7 days)
    // TODO: Uncomment when VehicleAlert model is available in Prisma Client
    // const sevenDaysAgo = new Date();
    // sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // const safetyAlerts = await this.prisma.vehicleAlert.count({
    //   where: {
    //     createdAt: {
    //       gte: sevenDaysAgo,
    //     },
    //     severity: {
    //       in: ['HIGH', 'CRITICAL'],
    //     },
    //   },
    // });
    const safetyAlerts = 0; // Placeholder until model is generated

    // Get pending vehicle approvals - Vehicle model doesn't have registrationStatus
    // So we'll count vehicles without registration numbers as pending
    const pendingVehicles = await this.prisma.vehicle.count({
      where: {
        registrationNumber: null,
      },
    });

    // Get total drivers count
    const totalDrivers = await this.prisma.driver.count();

    // Get inactive/suspended drivers
    const inactiveDrivers = await this.prisma.driver.count({
      where: {
        status: {
          in: ['INACTIVE', 'SUSPENDED'],
        },
      },
    });

    // Get drivers added this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const driversThisMonth = await this.prisma.driver.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    return {
      overview: {
        pendingVerifications,
        activeDrivers,
        safetyAlerts,
        pendingVehicleApprovals: pendingVehicles,
        totalDrivers,
        inactiveDrivers,
        driversThisMonth,
      },
      metrics: {
        verificationRate:
          totalDrivers > 0
            ? ((activeDrivers / totalDrivers) * 100).toFixed(1)
            : '0',
        alertsPerDriver:
          activeDrivers > 0
            ? (safetyAlerts / activeDrivers).toFixed(2)
            : '0',
      },
    };
  }

  /**
   * Get pending driver verifications with details
   */
  async getPendingVerifications(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [drivers, total] = await Promise.all([
      this.prisma.driver.findMany({
        where: {
          OR: [
            { status: 'PENDING' },
            { status: 'OTP_VERIFIED' },
          ],
        },
        select: {
          driver_id: true,
          name: true,
          phone: true,
          email: true,
          status: true,
          createdAt: true,
          vehicles: {
            select: {
              id: true,
              registrationNumber: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.driver.count({
        where: {
          OR: [
            { status: 'PENDING' },
            { status: 'OTP_VERIFIED' },
          ],
        },
      }),
    ]);

    return {
      data: drivers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get active drivers list
   */
  async getActiveDrivers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [drivers, total] = await Promise.all([
      this.prisma.driver.findMany({
        where: {
          status: 'ACTIVE',
        },
        select: {
          driver_id: true,
          name: true,
          phone: true,
          email: true,
          vehicles: {
            select: {
              id: true,
              registrationNumber: true,
              type: true,
              no_of_seats: true,
            },
          },
          _count: {
            select: {
              askDriverRequest: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
        skip,
        take: limit,
      }),
      this.prisma.driver.count({
        where: {
          status: 'ACTIVE',
        },
      }),
    ]);

    return {
      data: drivers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get safety alerts
   * TODO: Uncomment when VehicleAlert model is available in Prisma Client
   */
  async getSafetyAlerts(page = 1, limit = 10) {
    // const skip = (page - 1) * limit;

    // const [alerts, total] = await Promise.all([
    //   this.prisma.vehicleAlert.findMany({
    //     where: {
    //       status: {
    //         in: ['ACTIVE', 'ACKNOWLEDGED'],
    //       },
    //     },
    //     select: {
    //       id: true,
    //       vehicleId: true,
    //       driverId: true,
    //       alertType: true,
    //       severity: true,
    //       description: true,
    //       location: true,
    //       status: true,
    //       reportedAt: true,
    //       acknowledgedAt: true,
    //       affectedChildrenCount: true,
    //       estimatedDowntime: true,
    //     },
    //     orderBy: [
    //       { severity: 'desc' },
    //       { createdAt: 'desc' },
    //     ],
    //     skip,
    //     take: limit,
    //   }),
    //   this.prisma.vehicleAlert.count({
    //     where: {
    //       status: {
    //         in: ['ACTIVE', 'ACKNOWLEDGED'],
    //       },
    //     },
    //   }),
    // ]);

    return {
      data: [], // Placeholder until VehicleAlert model is available
      meta: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }

  /**
   * Approve driver
   */
  async approveDriver(driverId: number) {
    const driver = await this.prisma.driver.update({
      where: { driver_id: driverId },
      data: {
        status: 'ACTIVE',
      },
    });

    return {
      success: true,
      message: 'Driver approved successfully',
      driver,
    };
  }

  /**
   * Reject driver
   */
  async rejectDriver(driverId: number, reason: string) {
    const driver = await this.prisma.driver.update({
      where: { driver_id: driverId },
      data: {
        status: 'REJECTED',
      },
    });

    // Log the rejection reason in audit log
    // TODO: Uncomment when AuditLog model is available in Prisma Client
    // await this.prisma.auditLog.create({
    //   data: {
    //     userId: driverId,
    //     userType: 'DRIVER',
    //     action: 'DRIVER_REJECTED',
    //     entity: 'Driver',
    //     entityId: driverId,
    //     changes: { reason },
    //     description: `Driver rejected: ${reason}`,
    //   },
    // });

    return {
      success: true,
      message: 'Driver rejected',
      driver,
    };
  }
}
