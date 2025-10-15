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
    const owner = await this.prisma.vehicleOwner.findUnique({
      where: { id: userId },
      select: {
        first_name: true,
        last_name: true,
        Address: true,
        email: true,
        phone: true,
        company: true,
      },
    });

    console.log('Reached');
    if (!owner) return null;
    return {
      firstName: owner.first_name || '',
      lastName: owner.last_name || '',
      address: owner.Address || '',
      email: owner.email || '',
      phone: owner.phone || '',
      companyName: owner.company || '',
    };
  }

  async updateOwnerProfile(
    userId: number,
    updateData: any,
  ): Promise<OwnerDto | null> {
    const updated = await this.prisma.vehicleOwner.update({
      where: { id: userId },
      data: {
        first_name: updateData.firstName,
        last_name: updateData.lastName,
        Address: updateData.address,
        email: updateData.email,
        phone: updateData.phone,
        company: updateData.companyName,
      },
    });
    return {
      firstName: updated.first_name || '',
      lastName: updated.last_name || '',
      address: updated.Address || '',
      email: updated.email || '',
      phone: updated.phone || '',
      companyName: updated.company || '',
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

      const newDriver = await this.prisma.driver.create({
        data: {
          name: driverData.name,
          NIC: driverData.NIC,
          address: driverData.address,
          date_of_birth: new Date(driverData.date_of_birth),
          gender: driverData.gender,
          phone: driverData.phone,
          email: driverData.email || null,
          second_phone: driverData.second_phone || null,
          vehicle_Reg_No: driverData.vehicle_Reg_No || '',
          profile_picture_url: driverData.profile_picture_url,
          nic_front_pic_url: driverData.nic_front_pic_url,
          nice_back_pic_url: driverData.nice_back_pic_url,
          driver_license_front_url: driverData.driver_license_front_url,
          driver_license_back_url: driverData.driver_license_back_url,
          registrationStatus: RegistrationStatus.ACCOUNT_CREATED,
          status: 'ACTIVE',
        },
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
