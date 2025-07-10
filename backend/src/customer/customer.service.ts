import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterStaffPassengerDto } from './dto/register_staff_passenger.dto';
import { RegisterChildDto } from './dto/register-child.dto';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async registerStaffPassenger(dto: RegisterStaffPassengerDto) {
    // Check if already staff
    const exists = await this.prisma.staff_Passenger.findUnique({
      where: { customerId: dto.customerId },
    });
    if (exists)
      throw new BadRequestException('Already registered as staff passenger.');

    // Create Staff_Passenger
    await this.prisma.staff_Passenger.create({
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
    await this.prisma.customer.update({
      where: { id: dto.customerId },
      data: {
        name: dto.name,
        email: dto.email,
        address: dto.address,
        profileImageUrl: dto.profileImageUrl,
        emergencyContact: dto.emergencyContact,
        registrationStatus: 'STAFF_REGISTERED',
      },
    });

    return { success: true, message: 'Staff passenger registered.' };
  }

  async registerChild(dto: RegisterChildDto) {
    // Create Child
    await this.prisma.child.create({
      data: {
        customerId: dto.customerId,
        childName: dto.childName,
        relationship: dto.relationship,
        NearbyCity: dto.NearbyCity,
        schoolLocation: dto.schoolLocation,
        school: dto.school,
        pickUpAddress: dto.pickUpAddress,
        childImageUrl: dto.childImageUrl,
      },
    });

    // Update Customer with parent info
    await this.prisma.customer.update({
      where: { id: dto.customerId },
      data: {
        name: dto.parentName,
        email: dto.parentEmail,
        address: dto.parentAddress,
        profileImageUrl: dto.parentImageUrl,
        emergencyContact: dto.emergencyContact,
        registrationStatus: 'CHILD_REGISTERED',
      },
    });

    return { success: true, message: 'Child registered.' };
  }
}
