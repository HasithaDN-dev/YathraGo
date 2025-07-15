import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerRegisterDto } from './dto/customer-register.dto';

@Injectable()
export class CustomerServiceExtension {
  constructor(private prisma: PrismaService) {}

  /**
   * Complete customer registration after OTP verification.
   * @param customerId number (from JWT sub)
   * @param dto CustomerRegisterDto
   * @returns { customerId, success, message }
   */
  async completeCustomerRegistration(
    customerId: number,
    dto: CustomerRegisterDto,
  ) {
    try {
      const updatedCustomer = await this.prisma.customer.update({
        where: { customer_id: customerId },
        data: {
          name: dto.name,
          email: dto.email,
          address: dto.address,
          profileImageUrl: dto.profileImageUrl,
          emergencyContact: dto.emergencyContact,
          registrationStatus: 'CUSTOMER_REGISTERED',
        },
      });
      return {
        customerId: updatedCustomer.customer_id,
        success: true,
        message: 'Customer registration completed',
      };
    } catch (error) {
      return {
        customerId,
        success: false,
        message: error?.message || 'Failed to complete registration',
      };
    }
  }
}
