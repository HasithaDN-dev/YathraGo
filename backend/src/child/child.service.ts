import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterChildDto } from './dto/register-child.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChildService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterChildDto, childImageUrl?: string) {
    const { staffPassengerId, ...rest } = dto;

    const data: Prisma.ChildCreateInput = {
      ...rest,
      // Provide a default empty string if no image is uploaded to prevent null constraint violation
      childImageUrl: childImageUrl || '',
      staffPassenger: {
        connect: {
          staff_id: staffPassengerId,
        },
      },
    };

    return this.prisma.child.create({
      data,
    });
  }

  async linkChildToStaff(childId: number, staffPassengerId: number) {
    return this.prisma.child.update({
      where: { child_id: childId },
      data: { staffPassengerId },
    });
  }
}
