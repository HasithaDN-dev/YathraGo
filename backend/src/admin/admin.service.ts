/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Get parents (all customers in the database)
  async getParents() {
    try {
      const parents = await (this.prisma as any).customer.findMany({
        include: {
          children: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        count: parents.length,
        parents,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch parents';
      return {
        success: false,
        message,
        parents: [],
      };
    }
  }

  // Get staff passengers for admin dashboard
  async getStaffPassengers() {
    try {
      const staffPassengers = await (
        this.prisma as any
      ).staff_Passenger.findMany({
        include: {
          Customer: true,
        },
        orderBy: {
          id: 'desc',
        },
      });

      return {
        success: true,
        count: staffPassengers.length,
        staffPassengers,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch staff passengers';
      return {
        success: false,
        message,
        staffPassengers: [],
      };
    }
  }

  // Get all drivers for admin dashboard
  async getDrivers() {
    try {
      const drivers = await (this.prisma as any).driver.findMany({
        select: {
          driver_id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
          status: true,
          registrationStatus: true,
          createdAt: true,
          NIC: true,
          second_phone: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        count: drivers.length,
        drivers,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch drivers';
      return {
        success: false,
        message,
        drivers: [],
      };
    }
  }

  // Get vehicle owners for admin dashboard
  async getOwners() {
    try {
      const owners = await (this.prisma as any).vehicleOwner.findMany({
        select: {
          id: true,
          first_name: true,
          last_name: true,
          phone: true,
          email: true,
          Address: true,
          company: true,
        },
        orderBy: {
          id: 'desc',
        },
      });

      return {
        success: true,
        count: owners.length,
        owners,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch owners';
      return {
        success: false,
        message,
        owners: [],
      };
    }
  }

  // Get admins for admin dashboard
  async getAdmins() {
    try {
      const admins = await (this.prisma as any).admin.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          permissions: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        count: admins.length,
        admins,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch admins';
      return {
        success: false,
        message,
        admins: [],
      };
    }
  }

  // Get managers for admin dashboard
  async getManagers() {
    try {
      const managers = await (this.prisma as any).manager.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          department: true,
          level: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        count: managers.length,
        managers,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch managers';
      return {
        success: false,
        message,
        managers: [],
      };
    }
  }

  // Get backup drivers for admin dashboard
  async getBackupDrivers() {
    try {
      const backupDrivers = await (this.prisma as any).backupDriver.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          NIC: true,
          vehicle_Reg_No: true,
        },
        orderBy: {
          id: 'desc',
        },
      });

      return {
        success: true,
        count: backupDrivers.length,
        backupDrivers,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch backup drivers';
      return {
        success: false,
        message,
        backupDrivers: [],
      };
    }
  }

  // Get children for admin dashboard
  async getChildren() {
    try {
      const children = await (this.prisma as any).child.findMany({
        include: {
          Customer: true,
        },
        orderBy: {
          child_id: 'desc',
        },
      });

      return {
        success: true,
        count: children.length,
        children,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch children';
      return {
        success: false,
        message,
        children: [],
      };
    }
  }

  // Get web users for admin dashboard
  async getWebUsers() {
    try {
      const webusers = await (this.prisma as any).webuser.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        count: webusers.length,
        webusers,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch web users';
      return {
        success: false,
        message,
        webusers: [],
      };
    }
  }

  // Update user status
  async updateUserStatus(
    userType: string,
    userId: string,
    status: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const numericId = parseInt(userId, 10);

      if (isNaN(numericId)) {
        return {
          success: false,
          message: 'Invalid user ID',
        };
      }

      // Map userType to the appropriate model
      switch (userType.toLowerCase()) {
        case 'customer':
        case 'parent':
          await (this.prisma as any).customer.update({
            where: { customer_id: numericId },
            data: { status },
          });
          break;

        case 'staff-passenger':
        case 'staffpassenger': {
          // For staff passengers, update the Customer status
          const staffPassenger = await (
            this.prisma as any
          ).staff_Passenger.findUnique({
            where: { id: numericId },
            select: { customerId: true },
          });
          if (staffPassenger) {
            await (this.prisma as any).customer.update({
              where: { customer_id: staffPassenger.customerId },
              data: { status },
            });
          }
          break;
        }

        case 'driver':
          await (this.prisma as any).driver.update({
            where: { driver_id: numericId },
            data: { status },
          });
          break;

        case 'owner':
        case 'vehicleowner':
          await (this.prisma as any).vehicleOwner.update({
            where: { owner_id: numericId },
            data: { status },
          });
          break;

        case 'admin':
          await (this.prisma as any).admin.update({
            where: { admin_id: numericId },
            data: { status },
          });
          break;

        case 'manager':
          await (this.prisma as any).manager.update({
            where: { manager_id: numericId },
            data: { status },
          });
          break;

        case 'backup-driver':
        case 'backupdriver':
          await (this.prisma as any).backupDriver.update({
            where: { backup_driver_id: numericId },
            data: { status },
          });
          break;

        case 'child': {
          // For children, update the Customer status
          const child = await (this.prisma as any).child.findUnique({
            where: { child_id: numericId },
            select: { customerId: true },
          });
          if (child) {
            await (this.prisma as any).customer.update({
              where: { customer_id: child.customerId },
              data: { status },
            });
          }
          break;
        }

        case 'webuser':
        case 'web-user':
          await (this.prisma as any).webuser.update({
            where: { userId: numericId },
            data: { status },
          });
          break;

        default:
          return {
            success: false,
            message: `Unknown user type: ${userType}`,
          };
      }

      return {
        success: true,
        message: 'User status updated successfully',
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update user status';
      return {
        success: false,
        message,
      };
    }
  }
}
