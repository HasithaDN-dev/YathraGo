import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}
  getVehicles(userID: number): string {
    return `List of vehicles of the user: ${userID}`;
  }
}
