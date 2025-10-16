import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CityService {
  constructor(private prisma: PrismaService) {}

  async getAllCities() {
    return await this.prisma['city'].findMany({ orderBy: { name: 'asc' } });
  }
}
