/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterStaffPassengerDto } from './dto/register_staff_passenger.dto';
import { RegisterChildDto } from './dto/register-child.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CustomerRegisterDto } from './dto/customer-register.dto';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async registerStaffPassenger(dto: RegisterStaffPassengerDto) {
    console.log(
      '[SERVICE] registerStaffPassenger - Input:',
      JSON.stringify(dto, null, 2),
    );

    try {
      // Check if already staff
      // Check by customerId (not PK)
      const exists = await this.prisma.staff_Passenger.findFirst({
        where: { customerId: dto.customerId },
      });

      if (exists) {
        throw new BadRequestException('Already registered as staff passenger.');
      }

      // Use transaction to ensure data consistency and proper connection management
      const result = await this.prisma.$transaction(async (tx) => {
        // Create Staff_Passenger
        const staffPassenger = await tx.staff_Passenger.create({
          data: {
            customerId: dto.customerId,
            nearbyCity: dto.nearbyCity,
            workLocation: dto.workLocation,
            workAddress: dto.workAddress,
            pickUpLocation: dto.pickUpLocation,
            pickupAddress: dto.pickupAddress,
          },
        });

        // Update Customer profile
        const updatedCustomer = await tx.customer.update({
          where: { customer_id: dto.customerId },
          data: {
            registrationStatus: 'HAVING_A_PROFILE',
          },
        });

        return { staffPassenger, updatedCustomer };
      });

      const response = {
        success: true,
        message: 'Staff passenger registered.',
      };
      console.log(
        '[SERVICE] registerStaffPassenger - Output:',
        JSON.stringify(response, null, 2),
      );
      return response;
    } catch (error) {
      console.error('[SERVICE] registerStaffPassenger - Error:', error);
      throw error;
    }
  }

  async registerChild(dto: RegisterChildDto) {
    console.log(
      '[BACKEND] [SERVICE] registerChild - Input:',
      JSON.stringify(dto, null, 2),
    );

    try {
      // Use transaction to ensure data consistency and proper connection management
      await this.prisma.$transaction(async (tx) => {
        // Create Child
        await tx.child.create({
          data: {
            customerId: dto.customerId,
            childFirstName: dto.childName?.split(' ')[0] || dto.childName || '',
            childLastName: dto.childName?.split(' ').slice(1).join(' ') || '',
            gender: 'Unspecified',
            relationship: dto.relationship,
            nearbyCity: dto.nearbyCity,
            schoolLocation: dto.schoolLocation,
            school: dto.school,
            pickUpAddress: dto.pickUpAddress,
            childImageUrl: dto.childImageUrl ?? null,
          },
        });

        // Update Customer with parent info
        await tx.customer.update({
          where: { customer_id: dto.customerId },
          data: {
            registrationStatus: 'HAVING_A_PROFILE',
          },
        });
      });

      const result = { success: true, message: 'Child registered.' };
      console.log(
        '[SERVICE] registerChild - Output:',
        JSON.stringify(result, null, 2),
      );
      return result;
    } catch (error) {
      console.error('[SERVICE] registerChild - Error:', error);
      throw error;
    }
  }

  async getCustomerProfile(customerId: string) {
    console.log('[SERVICE] getCustomerProfile - Input customerId:', customerId);

    try {
      const customer = await this.prisma.customer.findUnique({
        where: { customer_id: parseInt(customerId) },
        include: {
          children: true,
          staffPassenger: true,
        },
      });

      if (!customer) {
        throw new BadRequestException('Customer not found');
      }

      const result = {
        success: true,
        profile: customer,
      };

      console.log(
        '[SERVICE] getCustomerProfile - Output: Found customer with',
        customer.children?.length || 0,
        'children and',
        customer.staffPassenger
          ? 'staff registration'
          : 'no staff registration',
      );
      return result;
    } catch (error) {
      console.error('[SERVICE] getCustomerProfile - Error:', error);
      throw error;
    }
  }

  async updateCustomerProfile(
    customerId: string,
    profileData: UpdateProfileDto,
  ) {
    console.log(
      '[SERVICE] updateCustomerProfile - Input customerId:',
      customerId,
    );
    console.log(
      '[SERVICE] updateCustomerProfile - Input data:',
      JSON.stringify(profileData, null, 2),
    );

    try {
      const updatedCustomer = await this.prisma.customer.update({
        where: { customer_id: parseInt(customerId) },
        data: {
          firstName:
            profileData?.name?.split(' ')[0] || profileData?.firstName || '',
          lastName:
            profileData?.name?.split(' ').slice(1).join(' ') ||
            profileData?.lastName ||
            '',
          email: profileData?.email || '',
          address: profileData?.address || '',
          profileImageUrl: profileData?.profileImageUrl || '',
          emergencyContact: profileData?.emergencyContact || '',
        },
      });

      const result = {
        success: true,
        message: 'Profile updated successfully',
        profile: updatedCustomer,
      };
      console.log(
        '[SERVICE] updateCustomerProfile - Output:',
        JSON.stringify(result, null, 2),
      );
      return result;
    } catch (error) {
      console.error('[SERVICE] updateCustomerProfile - Error:', error);
      throw error;
    }
  }
  /**
   * Complete customer registration after OTP verification.
   * @param customerId number (from JWT sub)
   * @param dto CustomerRegisterDto
   * @returns { customerId, success, message }
   */
  async completeCustomerRegistration(dto: CustomerRegisterDto) {
    try {
      const updatedCustomer = await this.prisma.customer.update({
        where: { customer_id: dto.customerId },
        data: {
          firstName: dto.name?.split(' ')[0] || '',
          lastName: dto.name?.split(' ').slice(1).join(' ') || '',
          email: dto.email,
          address: dto.address,
          profileImageUrl: dto.profileImageUrl,
          emergencyContact: dto.emergencyContact,
          registrationStatus: 'OTP_VERIFIED',
        },
      });
      return {
        customerId: updatedCustomer.customer_id,
        success: true,
        message: 'Customer registration completed',
      };
    } catch (error) {
      return {
        customerId: dto.customerId,
        success: false,
        message: error?.message || 'Failed to complete registration',
      };
    }
  }

  // Get all customers for admin dashboard
  async getAllCustomers() {
    try {
      const customers = await this.prisma.customer.findMany({
        select: {
          customer_id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          address: true,
          status: true,
          registrationStatus: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        count: customers.length,
        customers,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Failed to fetch customers',
        customers: [],
      };
    }
  }

  // Get user counts by role for admin dashboard
  async getUserCounts() {
    try {
      // Count all customers
      const totalCustomers = await this.prisma.customer.count();

      // Count parents (customers who have children)
      const parentsCount = await this.prisma.customer.count({
        where: {
          children: {
            some: {}, // Has at least one child
          },
        },
      });

      // Count staff passengers
      const staffPassengersCount = await this.prisma.staff_Passenger.count();

      // Count drivers
      const driversCount = await this.prisma.driver.count();

      // Count owners
      const ownersCount = await this.prisma.vehicleOwner.count();

      // Count admins
      const adminsCount = await this.prisma.admin.count();

      // Count managers
      const managersCount = await this.prisma.manager.count();

      // Count backup drivers
      const backupDriversCount = await this.prisma.backupDriver.count();

      // Count children
      const childrenCount = await this.prisma.child.count();

      // Count webusers
      const webusersCount = await this.prisma.webuser.count();

      return {
        success: true,
        counts: {
          parents: parentsCount,
          staffPassengers: staffPassengersCount,
          drivers: driversCount,
          owners: ownersCount,
          admins: adminsCount,
          managers: managersCount,
          backupDrivers: backupDriversCount,
          children: childrenCount,
          webusers: webusersCount,
          totalCustomers: totalCustomers,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Failed to fetch user counts',
        counts: {
          parents: 0,
          staffPassengers: 0,
          drivers: 0,
          owners: 0,
          admins: 0,
          managers: 0,
          backupDrivers: 0,
          children: 0,
          webusers: 0,
          totalCustomers: 0,
        },
      };
    }
  }
}
