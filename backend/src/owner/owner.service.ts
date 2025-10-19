import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OwnerDto } from './dto/owner.dto';
import { RegistrationStatus } from '@prisma/client';

@Injectable()
export class OwnerService {
  constructor(private prisma: PrismaService) {}

  async getOwnerProfile(userId: number): Promise<OwnerDto | null> {
    // Owners are stored in the Webuser table (role = OWNER).
    const user = await this.prisma.webuser.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        phone: true,
        address: true,
        fcmToken: true,
      },
    });

    if (!user) return null;
    return {
      firstName: user.username || '',
      lastName: '',
      address: user.address || '',
      email: user.email || '',
      phone: user.phone || '',
      companyName: '',
    };
  }

  async updateOwnerProfile(
    userId: number,
    updateData: any,
  ): Promise<OwnerDto | null> {
    const updated = await this.prisma.webuser.update({
      where: { id: userId },
      data: {
        username: updateData.firstName ?? undefined,
        email: updateData.email ?? undefined,
        phone: updateData.phone ?? undefined,
        address: updateData.address ?? undefined,
      },
    });

    return {
      firstName: updated.username || '',
      lastName: '',
      address: updated.address || '',
      email: updated.email || '',
      phone: updated.phone || '',
      companyName: '',
    };
  }

  // --- ADD DRIVER METHOD ---
  async addDriver(driverData: any): Promise<any> {
    try {
      // Check for unique phone number
      const existingPhoneUser = await this.prisma.driver.findFirst({
        where: { phone: driverData.phone },
      });
      if (existingPhoneUser) {
        throw new ConflictException(
          'Phone number already registered by another driver.',
        );
      }

      // Check for unique email if provided
      if (driverData.email) {
        const existingEmailUser = await this.prisma.driver.findFirst({
          where: { email: driverData.email },
        });
        if (existingEmailUser) {
          throw new ConflictException(
            'Email already registered by another driver.',
          );
        }
      }

      // Check for unique NIC
      const existingNIC = await this.prisma.driver.findFirst({
        where: { NIC: driverData.NIC },
      });
      if (existingNIC) {
        throw new ConflictException(
          'NIC already registered by another driver.',
        );
      }

      const createPayload: any = {
        name: driverData.name,
        NIC: driverData.NIC,
        address: driverData.address,
        date_of_birth: new Date(driverData.date_of_birth),
        gender: driverData.gender,
        phone: driverData.phone,
        email: driverData.email || null,
        second_phone: driverData.second_phone || '', // Use empty string instead of null
        vehicle_Reg_No: driverData.vehicle_Reg_No || '',
        profile_picture_url: driverData.profile_picture_url || '',
        nic_front_pic_url: driverData.nic_front_pic_url || '',
        nice_back_pic_url: driverData.nice_back_pic_url || '',
        driver_license_front_url: driverData.driver_license_front_url || '',
        driver_license_back_url: driverData.driver_license_back_url || '',
        registrationStatus: RegistrationStatus.ACCOUNT_CREATED,
        status: 'ACTIVE',
      };

      const newDriver = await this.prisma.driver.create({
        data: createPayload,
      });

      return {
        success: true,
        message: 'Driver added successfully',
        data: newDriver,
      };
    } catch (error) {
      console.error('Error adding driver:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        throw new ConflictException(
          `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
        );
      }
      throw new BadRequestException(
        'Failed to add driver. Please check provided data.',
      );
    }
  }

  // --- GET ALL DRIVERS METHOD ---
  async getAllDrivers(): Promise<any> {
    try {
      const drivers = await this.prisma.driver.findMany({
        select: {
          driver_id: true,
          name: true,
          phone: true,
          email: true,
          NIC: true,
          address: true,
          date_of_birth: true,
          gender: true,
          profile_picture_url: true,
          registrationStatus: true,
          status: true,
          vehicle_Reg_No: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        message: 'Drivers retrieved successfully',
        data: drivers,
      };
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw new BadRequestException('Failed to fetch drivers.');
    }
  }
}
