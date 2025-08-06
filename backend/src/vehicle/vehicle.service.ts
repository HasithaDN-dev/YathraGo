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
      include: {
        driver: true,
      },
    });

    if (vehicleList.length === 0) {
      throw new NotFoundException('No vehicle found');
    }
    return vehicleList;
  }

  //adding vehices of a paticular owner
  async addVehicle(userID: number, data: any): Promise<any> {
    const result = await this.prisma.vehicle.create({
      data: {
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
      },
    });

    return {
      success: true,
      message: 'Vehicle added successfully',
      data: result,
    };
  }

  //update vehcile details
  async updateVehicle(id: number, vehicleDto: any): Promise<any> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    //console.log(vehicleDto);

    const updatedVehicle = await this.prisma.vehicle.update({
      where: {
        id: id,
      },
      data: { ...vehicleDto },
    });

    return {
      success: true,
      message: 'Vehicle updated successfully',
      data: updatedVehicle,
    };
  }

  //deleting a vehicle
  async deleteVehicle(id: number): Promise<any> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.prisma.vehicle.delete({
      where: { id },
    });

    return {
      message: 'Vehicle deleted successfully',
    };
  }
}
