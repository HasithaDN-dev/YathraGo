import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterStaffDto } from './dto/register-staff.dto';

@Injectable()
export class StaffPassengerService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterStaffDto) {
    // TODO: Fix this implementation based on the correct DTO structure
    throw new BadRequestException(
      'Staff registration endpoint temporarily disabled',
    );
    /*
    const exists = await this.prisma.staff_Passenger.findUnique({
      where: { userId: dto.userId },
    });
    if (exists) throw new BadRequestException('User already registered as staff.');
    return this.prisma.staff_Passenger.create({ 
      data: {
        userId: dto.userId,
        nearbyCity: dto.nearbyCity,
        workLocation: dto.workLocation,
        workAddress: dto.workAddress,
        pickUpLocation: dto.pickUpLocation,
        pickupAddress: dto.pickupAddress,
      } 
    });
    */
  }
}
