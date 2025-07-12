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
  async addVehicle(userID: number,data: any): Promise<CreateVehicleDto> {
    const result = this.prisma.vehicle.create({
      data:{
        ...data,
        ownerId: userID,
        rear_picture_url: data.rear_picture_url,
        front_picture_url: data.front_picture_url,
        side_picture_url: data.side_picture_url,
        inside_picture_url: data.inside_picture_url,
        revenue_license_url: data.revenue_license_url,
        insurance_front_url: data.insurance_front_url,
        insurance_back_url: data.insurance_back_url,
        vehicle_reg_url: data.vehicle_reg_url,
      }
    });

    return result;
  }
}
