import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OwnerDto } from './dto/owner.dto';

@Injectable()
export class OwnerService {
  constructor(private prisma: PrismaService) {}

  async getOwnerProfile(userId: number): Promise<OwnerDto | null> {
    const owner = await this.prisma.vehicleOwner.findUnique({
      where: { id: userId },
      select: {
        first_name: true,
        last_name: true,
        Address: true,
        email: true,
        phone: true,
        company: true,
      },
    });

    console.log("Reached");
    if (!owner) return null;
    return {
      firstName: owner.first_name || '',
      lastName: owner.last_name || '',
      address: owner.Address || '',
      email: owner.email || '',
      phone: owner.phone || '',
      companyName: owner.company || '',
    };
  }

  async updateOwnerProfile(userId: number, updateData: any): Promise<OwnerDto | null> {
    const updated = await this.prisma.vehicleOwner.update({
      where: { id: userId },
      data: {
        first_name: updateData.firstName,
        last_name: updateData.lastName,
        Address: updateData.address,
        email: updateData.email,
        phone: updateData.phone,
        company: updateData.companyName,
      },
    });
    return {
      firstName: updated.first_name || '',
      lastName: updated.last_name || '',
      address: updated.Address || '',
      email: updated.email || '',
      phone: updated.phone || '',
      companyName: updated.company || '',
    };
  }
}
