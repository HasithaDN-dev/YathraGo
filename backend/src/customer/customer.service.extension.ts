/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerRegisterDto } from './dto/customer-register.dto';

@Injectable()
export class CustomerServiceExtension {
  constructor(private prisma: PrismaService) {}

  /**
   * Complete customer registration after OTP verification.
   * @param dto CustomerRegisterDto
   * @returns An object containing customerId, success, and message.
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
          registrationStatus: 'HAVING_A_PROFILE' as any,
        },
      });
      return {
        customerId: updatedCustomer.customer_id,
        success: true,
        message: 'Customer registration completed',
      };
    } catch (error: any) {
      return {
        customerId: dto.customerId,
        success: false,
        message:
          typeof error?.message === 'string'
            ? error.message
            : 'Failed to complete registration',
      };
    }
  }
}
