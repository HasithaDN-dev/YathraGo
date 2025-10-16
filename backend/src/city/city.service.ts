import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CityService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: string) {
    const base = {
      select: { id: true, name: true, latitude: true, longitude: true },
      orderBy: { name: 'asc' } as const,
    };

    if (!query) {
      // no filter
      return this.prisma.city.findMany(base);
    }

    // when filtering, provide an explicit where clause
    return this.prisma.city.findMany({
      ...base,
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
    });
  }
}
