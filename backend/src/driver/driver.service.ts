// src/driver/driver.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException, // Added ConflictException for email uniqueness check
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// Import the new combined DTO
import { CompleteDriverRegistrationDto } from './dto/complete-driver-registration.dto';
// Import existing DTOs for other methods (if you merge them back)
import { UpdateDriverProfileDto } from './dto/update-driver-profile.dto'; // Assuming this DTO exists
import { UploadDocumentsDto } from './dto/upload-documents.dto'; // Assuming this DTO exists
import { Driver, RegistrationStatus } from '@prisma/client';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  // Fetch driver details for a given driverId (for frontend welcome message)

  // --- EXISTING METHODS (from your provided driver.service.ts) ---
  async getDriverProfile(driverId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { driver_id: parseInt(driverId) },
    });

    if (!driver) {
      throw new BadRequestException('Driver not found');
    }

    return {
      success: true,
      profile: driver,
    };
  }

  async updateDriverProfile(
    driverId: string,
    profileData: UpdateDriverProfileDto,
  ) {
    // Check for unique email if provided (application-level check as schema doesn't enforce @unique)
    if (profileData.email) {
      const existingEmailUser = await this.prisma.driver.findFirst({
        where: { email: profileData.email },
      });
      // If an existing user with this email is found AND it's not the current driver
      if (
        existingEmailUser &&
        existingEmailUser.driver_id !== parseInt(driverId)
      ) {
        throw new ConflictException(
          'Email already registered by another driver.',
        );
      }
    }

    const updatedDriver = await this.prisma.driver.update({
      where: { driver_id: parseInt(driverId) },
      data: {
        name: profileData.name,
        email: profileData.email,
        address: profileData.address,
        NIC: profileData.NIC,
        date_of_birth: profileData.date_of_birth
          ? new Date(profileData.date_of_birth)
          : undefined,
        gender: profileData.gender,
        second_phone: profileData.second_phone,
        profile_picture_url: profileData.profile_picture_url,
        // registrationStatus: 'ACCOUNT_CREATED', // This might be set by the initial registration
      },
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      profile: updatedDriver,
    };
  }

  async uploadDriverDocuments(
    driverId: string,
    documentsData: UploadDocumentsDto,
  ) {
    const updatedDriver = await this.prisma.driver.update({
      where: { driver_id: parseInt(driverId) },
      data: {
        driver_license_front_url: documentsData.driver_license_front_url,
        driver_license_back_url: documentsData.driver_license_back_url,
        nic_front_pic_url: documentsData.nic_front_pic_url,
        nice_back_pic_url: documentsData.nic_back_pic_url,
        vehicle_Reg_No: documentsData.vehicle_registration,
        // registrationStatus: 'ACCOUNT_CREATED', // This might be set by the initial registration
      },
    });

    return {
      success: true,
      message: 'Documents uploaded successfully',
      profile: updatedDriver,
    };
  }

  // --- NEW METHOD FOR SINGLE-PHASE DRIVER REGISTRATION ---
  async completeDriverRegistration(
    phone: string, // Securely obtained from JWT
    registrationData: CompleteDriverRegistrationDto,
  ): Promise<Driver> {
    const driver = await this.prisma.driver.findFirst({
      where: { phone: phone },
    });

    if (!driver) {
      throw new NotFoundException(
        `Driver with phone ${phone} not found. Ensure OTP verification was completed.`,
      );
    }

    // Driver must be OTP_VERIFIED to proceed with registration
    if (driver.registrationStatus !== RegistrationStatus.OTP_VERIFIED) {
      // If already fully registered, prevent re-registration
      if (driver.registrationStatus === RegistrationStatus.ACCOUNT_CREATED) {
        throw new BadRequestException('Driver is already fully registered.');
      }
      throw new BadRequestException(
        'Driver not in OTP_VERIFIED state. Please complete OTP verification first.',
      );
    }

    // Check for unique email if provided (application-level check as schema doesn't enforce @unique)
    if (registrationData.email) {
      const existingEmailUser = await this.prisma.driver.findFirst({
        where: { email: registrationData.email },
      });
      if (
        existingEmailUser &&
        existingEmailUser.driver_id !== driver.driver_id
      ) {
        throw new ConflictException(
          'Email already registered by another driver.',
        );
      }
    }

    try {
      const updatedDriver = await this.prisma.driver.update({
        where: { driver_id: driver.driver_id },
        data: {
          name: registrationData.name,
          NIC: registrationData.NIC,
          address: registrationData.address,
          date_of_birth: new Date(registrationData.date_of_birth),
          gender: registrationData.gender,
          profile_picture_url: registrationData.profile_picture_url,
          email: registrationData.email,
          driver_license_front_url: registrationData.driver_license_front_url,
          driver_license_back_url: registrationData.driver_license_back_url,
          nic_front_pic_url: registrationData.nic_front_pic_url,
          nice_back_pic_url: registrationData.nice_back_pic_url,
          second_phone: registrationData.second_phone,
          vehicle_Reg_No: registrationData.vehicle_Reg_No, // This field is in your Driver model
          registrationStatus: RegistrationStatus.ACCOUNT_CREATED, // Set to ACCOUNT_CREATED after all details
        },
      });
      return updatedDriver;
    } catch (error) {
      console.error('Error completing driver registration:', error);
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new ConflictException(
          'Email already registered by another driver.',
        );
      }
      throw new BadRequestException(
        'Failed to complete driver registration. Please check provided data.',
      );
    }
  }

  // Fetch driver details for a given driverId (for frontend welcome message)
  async getDriverDetailsById(driverId: number) {
    const driver = await this.prisma.driver.findUnique({
      where: { driver_id: driverId },
      select: {
        driver_id: true,
        name: true,
        email: true,
        phone: true,
        profile_picture_url: true,
        status:true,
      },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    return driver;
  }
}
