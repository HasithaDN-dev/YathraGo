import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterStaffDto } from './dto/register-staff.dto';

@Injectable()
export class StaffPassengerService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterStaffDto) {
    const exists = await this.prisma.staff_Passenger.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new BadRequestException('Email already registered.');
    return this.prisma.staff_Passenger.create({ data: dto });
  }
}
