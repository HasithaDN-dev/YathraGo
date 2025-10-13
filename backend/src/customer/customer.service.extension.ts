import { Injectable } from '@nestjs/common';
import { Express } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerRegisterDto } from './dto/customer-register.dto';

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

@Injectable()
export class CustomerServiceExtension {
  constructor(protected prisma: PrismaService) {}

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
          firstName: dto.firstName,
          lastName: dto.lastName,
          gender: dto.gender,
          email: dto.email,
          address: dto.address,
          profileImageUrl: dto.profileImageUrl,
          emergencyContact: dto.emergencyContact,
          registrationStatus: 'HAVING_A_PROFILE',
        },
      });
      return {
        customerId: updatedCustomer.customer_id,
        success: true,
        message: 'Customer registration completed',
      };
    } catch (error) {
      let message = 'Failed to complete registration';
      if (isErrorWithMessage(error)) {
        message = error.message;
      }
      return {
        customerId: dto.customerId,
        success: false,
        message,
      };
    }
  }
  /**
   * Handles image upload for customer or child profile images.
   * @param file The uploaded file
   * @param type 'customer' | 'child'
   * @returns An object with success and filename or error message
   */
  handleImageUpload(file: Express.Multer.File) {
    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }
    // Validate mimetype
    if (!file.mimetype.startsWith('image/')) {
      return { success: false, message: 'Only image files are allowed!' };
    }
    // Multer diskStorage already saves the file with a unique name in the correct folder
    if (!file.filename) {
      return {
        success: false,
        message: 'File upload failed: filename missing.',
      };
    }
    // file.filename may already have subfolder prefix (e.g., 'child/filename.jpg')
    return { success: true, filename: file.filename };
  }
}
