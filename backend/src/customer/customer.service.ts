import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterStaffPassengerDto } from './dto/register_staff_passenger.dto';
import { RegisterChildDto } from './dto/register-child.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
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
        // Create Staff_Passenger with location coordinates
        await tx.staff_Passenger.create({
          data: {
            customerId: dto.customerId,
            nearbyCity: dto.nearbyCity,
            workLocation: dto.workLocation,
            workAddress: dto.workAddress,
            workLatitude: dto.workLatitude || null,
            workLongitude: dto.workLongitude || null,
            pickUpLocation: dto.pickUpLocation,
            pickupAddress: dto.pickupAddress,
            pickupLatitude: dto.pickupLatitude || null,
            pickupLongitude: dto.pickupLongitude || null,
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
            // Store location coordinates
            schoolLatitude: dto.schoolLatitude ?? null,
            schoolLongitude: dto.schoolLongitude ?? null,
            pickupLatitude: dto.pickupLatitude ?? null,
            pickupLongitude: dto.pickupLongitude ?? null,
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
              workLatitude: true,
              workLongitude: true,
              pickUpLocation: true,
              pickupAddress: true,
              pickupLatitude: true,
              pickupLongitude: true,
            },
          },
        },
      });

      if (!customer) {
        throw new BadRequestException('Customer not found');
      }

      // Helper to build full image URL, now expects path with subfolder
      const baseUrl = process.env.SERVER_BASE_URL || 'http://localhost:3000';
      const getImageUrl = (filepath: string | null) =>
        filepath ? `${baseUrl}/uploads/${filepath}` : null;

      // Map children with full image URLs
      const childrenWithFullImageUrl = (customer.children || []).map(
        (child) => {
          // If childImageUrl exists and does not already include a subfolder, prefix with 'child/'
          let childImagePath = child.childImageUrl || null;
          if (childImagePath && !childImagePath.includes('/')) {
            childImagePath = `child/${childImagePath}`;
          }
          return {
            ...child,
            childImageUrl: getImageUrl(childImagePath),
          };
        },
      );

      // For customer profile image, prefix with 'customer/' if not already present
      let customerImagePath = customer.profileImageUrl || null;
      if (customerImagePath && !customerImagePath.includes('/')) {
        customerImagePath = `customer/${customerImagePath}`;
      }

      // Map customer profile image URL
      const profileWithFullImageUrl = {
        ...customer,
        profileImageUrl: getImageUrl(customerImagePath),
        children: childrenWithFullImageUrl,
        // Add staffPassenger with profileImageUrl if exists
        staffPassenger: customer.staffPassenger
          ? {
              ...customer.staffPassenger,
              profileImageUrl: getImageUrl(customerImagePath),
            }
          : null,
      };

      const result = {
        success: true,
        profile: profileWithFullImageUrl,
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

  async updateCustomerProfile(userId: number, profileData: UpdateProfileDto) {
    console.log(
      '[SERVICE] updateCustomerProfile - Input:',
      JSON.stringify({ userId, profileData }, null, 2),
    );

    try {
      const customer = await this.prisma.customer.update({
        where: { customer_id: userId },
        data: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          gender: profileData.gender,
          email: profileData.email,
          address: profileData.address,
          profileImageUrl: profileData.profileImageUrl,
          emergencyContact: profileData.emergencyContact,
        },
      });

      const response = {
        success: true,
        message: 'Customer profile updated successfully.',
        customer,
      };
      console.log(
        '[SERVICE] updateCustomerProfile - Output:',
        JSON.stringify(response, null, 2),
      );
      return response;
    } catch (error) {
      console.error('[SERVICE] updateCustomerProfile - Error:', error);
      throw error;
    }
  }

  async updateChildProfile(
    childId: number,
    childData: UpdateChildDto,
    userId: number,
  ) {
    console.log(
      '[SERVICE] updateChildProfile - Input:',
      JSON.stringify({ childId, childData, userId }, null, 2),
    );

    try {
      // Verify child belongs to this customer
      const existingChild = await this.prisma.child.findFirst({
        where: {
          child_id: childId,
          customerId: userId,
        },
      });

      if (!existingChild) {
        throw new BadRequestException('Child not found or unauthorized');
      }

      const updatedChild = await this.prisma.child.update({
        where: { child_id: childId },
        data: {
          childFirstName: childData.childFirstName,
          childLastName: childData.childLastName,
          gender: childData.gender,
          relationship: childData.relationship,
          nearbyCity: childData.nearbyCity,
          school: childData.school,
          schoolLocation: childData.schoolLocation,
          pickUpAddress: childData.pickUpAddress,
          childImageUrl: childData.childImageUrl,
          schoolLatitude: childData.schoolLatitude,
          schoolLongitude: childData.schoolLongitude,
          pickupLatitude: childData.pickupLatitude,
          pickupLongitude: childData.pickupLongitude,
        },
      });

      const response = {
        success: true,
        message: 'Child profile updated successfully.',
        child: updatedChild,
      };
      console.log(
        '[SERVICE] updateChildProfile - Output:',
        JSON.stringify(response, null, 2),
      );
      return response;
    } catch (error) {
      console.error('[SERVICE] updateChildProfile - Error:', error);
      throw error;
    }
  }

  async updateStaffProfile(userId: number, staffData: UpdateStaffDto) {
    console.log(
      '[SERVICE] updateStaffProfile - Input:',
      JSON.stringify({ userId, staffData }, null, 2),
    );

    try {
      // Verify staff profile belongs to this customer
      const existingStaff = await this.prisma.staff_Passenger.findFirst({
        where: { customerId: userId },
      });

      if (!existingStaff) {
        throw new BadRequestException('Staff profile not found');
      }

      const updatedStaff = await this.prisma.staff_Passenger.update({
        where: { id: existingStaff.id },
        data: {
          nearbyCity: staffData.nearbyCity,
          workLocation: staffData.workLocation,
          workAddress: staffData.workAddress,
          pickUpLocation: staffData.pickUpLocation,
          pickupAddress: staffData.pickupAddress,
          workLatitude: staffData.workLatitude,
          workLongitude: staffData.workLongitude,
          pickupLatitude: staffData.pickupLatitude,
          pickupLongitude: staffData.pickupLongitude,
        },
      });

      const response = {
        success: true,
        message: 'Staff profile updated successfully.',
        staff: updatedStaff,
      };
      console.log(
        '[SERVICE] updateStaffProfile - Output:',
        JSON.stringify(response, null, 2),
      );
      return response;
    } catch (error) {
      console.error('[SERVICE] updateStaffProfile - Error:', error);
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
