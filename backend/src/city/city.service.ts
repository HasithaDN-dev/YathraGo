import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CityService {
  constructor(private prisma: PrismaService) {}

  // Get all cities in the database
  async findAll() {
    const cities = await this.prisma.city.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      count: cities.length,
      data: cities,
    };
  }

  // Get a specific city by ID with all its data
  async findOne(id: number) {
    const city = await this.prisma.city.findUnique({
      where: { id },
    });

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    return {
      success: true,
      data: city,
    };
  }
}
