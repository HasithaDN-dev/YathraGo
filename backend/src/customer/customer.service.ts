import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterStaffPassengerDto } from './dto/register_staff_passenger.dto';
import { RegisterChildDto } from './dto/register-child.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CustomerRegisterDto } from './dto/customer-register.dto';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { CustomerServiceExtension } from './customer.service.extension';
@Injectable()
export class CustomerService extends CustomerServiceExtension {
  constructor(protected prisma: PrismaService) {
    super(prisma);
  }

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
      await this.prisma.$transaction(async (tx) => {
        // Create Staff_Passenger
        await tx.staff_Passenger.create({
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
        await tx.customer.update({
          where: { customer_id: dto.customerId },
          data: {
            registrationStatus: 'HAVING_A_PROFILE',
          },
        });
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
            childFirstName: dto.childFirstName,
            childLastName: dto.childLastName,
            gender: dto.gender, // Prisma expects enum, DTO validated
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
      // Optimized query - only fetch necessary fields
      const customer = await this.prisma.customer.findUnique({
        where: { customer_id: parseInt(customerId) },
        select: {
          customer_id: true,
          firstName: true,
          lastName: true,
          gender: true,
          phone: true,
          email: true,
          address: true,
          profileImageUrl: true,
          emergencyContact: true,
          status: true,
          registrationStatus: true,
          children: {
            select: {
              child_id: true,
              childFirstName: true,
              childLastName: true,
              gender: true,
              relationship: true,
              nearbyCity: true,
              schoolLocation: true,
              school: true,
              childImageUrl: true,
              pickUpAddress: true,
            },
          },
          staffPassenger: {
            select: {
              id: true,
              nearbyCity: true,
              workLocation: true,
              workAddress: true,
              pickUpLocation: true,
              pickupAddress: true,
            },
          },
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
          firstName: profileData?.firstName ?? undefined,
          lastName: profileData?.lastName ?? undefined,
          gender: profileData?.gender ?? undefined,
          email: profileData?.email ?? undefined,
          address: profileData?.address ?? undefined,
          profileImageUrl: profileData?.profileImageUrl ?? undefined,
          emergencyContact: profileData?.emergencyContact ?? undefined,
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
   * @param dto CustomerRegisterDto
   * @returns { customerId, success, message, registrationStatus }
   */
  async completeCustomerRegistration(dto: CustomerRegisterDto) {
    try {
      const updatedCustomer = await this.prisma.customer.update({
        where: { customer_id: dto.customerId },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          gender: dto.gender, // Prisma expects enum, DTO validated
          email: dto.email,
          address: dto.address,
          profileImageUrl: dto.profileImageUrl,
          emergencyContact: dto.emergencyContact,
          registrationStatus: 'ACCOUNT_CREATED',
        },
      });

      console.log(
        '[SERVICE] completeCustomerRegistration - Status updated to ACCOUNT_CREATED for customer:',
        dto.customerId,
      );

      return {
        customerId: updatedCustomer.customer_id,
        success: true,
        message: 'Customer registration completed',
        registrationStatus: updatedCustomer.registrationStatus,
      };
    } catch (error) {
      console.error('[SERVICE] completeCustomerRegistration - Error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to complete registration';
      return {
        customerId: dto.customerId,
        success: false,
        message: errorMessage,
      };
    }
  }
}
