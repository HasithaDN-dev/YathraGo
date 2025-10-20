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
        OR: [{ status: 'PENDING' }, { status: 'OTP_VERIFIED' }],
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
          activeDrivers > 0 ? (safetyAlerts / activeDrivers).toFixed(2) : '0',
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
          OR: [{ status: 'PENDING' }, { status: 'OTP_VERIFIED' }],
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
          OR: [{ status: 'PENDING' }, { status: 'OTP_VERIFIED' }],
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

  /**
   * Get pending vehicles
   */
  async getPendingVehicles(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: {
          registrationNumber: null,
        },
        include: {
          VehicleOwner: true,
          driver: true,
        },
        skip,
        take: limit,
        orderBy: {
          id: 'desc',
        },
      }),
      this.prisma.vehicle.count({
        where: {
          registrationNumber: null,
        },
      }),
    ]);

    return {
      success: true,
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Approve vehicle
   */
  async approveVehicle(vehicleId: number) {
    // Generate registration number (you might have your own logic)
    const registrationNumber = `REG-${Date.now()}-${vehicleId}`;

    const vehicle = await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        registrationNumber,
      },
      include: {
        VehicleOwner: true,
        driver: true,
      },
    });

    return {
      success: true,
      message: 'Vehicle approved successfully',
      vehicle,
    };
  }

  /**
   * Reject vehicle
   */
  async rejectVehicle(vehicleId: number, reason: string) {
    // For now, we'll delete the vehicle or mark it somehow
    // Since there's no status field, we could add a rejection note
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        VehicleOwner: true,
        driver: true,
      },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    // Log the rejection reason (TODO: implement proper rejection handling)
    // For now, we'll just return the vehicle data with the reason
    
    return {
      success: true,
      message: 'Vehicle rejected',
      vehicle,
      reason,
    };
  }

  /**
   * Get driver inquiries/complaints
   */
  async getDriverInquiries(page = 1, limit = 10, status?: string, category?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {
      senderUserType: 'DRIVER',
    };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    const [inquiries, total] = await Promise.all([
      this.prisma.complaintsInquiries.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.complaintsInquiries.count({
        where,
      }),
    ]);

    // Fetch driver details for each inquiry
    const inquiriesWithDriverInfo = await Promise.all(
      inquiries.map(async (inquiry) => {
        const driver = await this.prisma.driver.findUnique({
          where: { driver_id: inquiry.senderId },
          select: {
            driver_id: true,
            name: true,
            phone: true,
            email: true,
            vehicle_Reg_No: true,
          },
        });

        return {
          ...inquiry,
          driverInfo: driver,
        };
      })
    );

    return {
      success: true,
      data: inquiriesWithDriverInfo,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get inquiry statistics
   */
  async getInquiryStatistics() {
    const [
      totalInquiries,
      pendingCount,
      inProgressCount,
      resolvedCount,
      byCategory,
      byType,
    ] = await Promise.all([
      this.prisma.complaintsInquiries.count({
        where: { senderUserType: 'DRIVER' },
      }),
      this.prisma.complaintsInquiries.count({
        where: { senderUserType: 'DRIVER', status: 'PENDING' },
      }),
      this.prisma.complaintsInquiries.count({
        where: { senderUserType: 'DRIVER', status: 'IN_PROGRESS' },
      }),
      this.prisma.complaintsInquiries.count({
        where: { senderUserType: 'DRIVER', status: 'RESOLVED' },
      }),
      this.prisma.complaintsInquiries.groupBy({
        by: ['category'],
        where: { senderUserType: 'DRIVER' },
        _count: { id: true },
      }),
      this.prisma.complaintsInquiries.groupBy({
        by: ['type'],
        where: { senderUserType: 'DRIVER' },
        _count: { id: true },
      }),
    ]);

    return {
      success: true,
      overview: {
        total: totalInquiries,
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
      },
      byCategory: byCategory.map((item) => ({
        category: item.category,
        count: item._count.id,
      })),
      byType: byType.map((item) => ({
        type: item.type,
        count: item._count.id,
      })),
    };
  }

  /**
   * Update inquiry status
   */
  async updateInquiryStatus(id: number, status: string) {
    const inquiry = await this.prisma.complaintsInquiries.findUnique({
      where: { id },
    });

    if (!inquiry) {
      throw new Error('Inquiry not found');
    }

    const updated = await this.prisma.complaintsInquiries.update({
      where: { id },
      data: { status: status as any },
    });

    return {
      success: true,
      message: 'Inquiry status updated successfully',
      data: updated,
    };
  }
}
