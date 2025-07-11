import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVehicleDto, VehicleResponseDto } from './dto';
import { throwError } from 'rxjs';

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}

  //fetching vehicles by owner id
  async getVehicles(userID: number): Promise<VehicleResponseDto[]> {
    //return `List of vehicles of the user: ${userID}`;

    const vehicleList = await this.prisma.vehicle.findMany({
      where: {
        ownerId: userID,
      },
    });

   if (vehicleList.length === 0) {
    throw new NotFoundException('No vehicle found');
    }
    return vehicleList;
  }

  //adding vehices of a paticular owner
  async addVehicle(userID: number,data: CreateVehicleDto): Promise<VehicleResponseDto> {
    // const result = this.prisma.vehicle.create({

    // });

    return "data added";
  }
}
