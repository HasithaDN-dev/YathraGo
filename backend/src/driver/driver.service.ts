import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDriverProfileDto } from './dto/update-driver-profile.dto';
import { UploadDocumentsDto } from './dto/upload-documents.dto';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

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
        registrationStatus: 'FULLY_REGISTERED',
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
        registrationStatus: 'FULLY_REGISTERED',
      },
    });

    return {
      success: true,
      message: 'Documents uploaded successfully',
      profile: updatedDriver,
    };
  }
}
