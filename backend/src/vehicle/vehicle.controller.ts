import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VehicleService } from './vehicle.service';
import { User } from 'src/auth-web/decorators';
import { Webuser } from '@prisma/client';
import { JwtGuard } from 'src/auth-web/guards';
import { RolesGuard } from 'src/auth-web/guards/roles.guards';
import { Roles } from 'src/auth-web/decorators/roles.decorator';
import { CreateVehicleDto, VehicleResponseDto } from './dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerConfigVehicle } from 'src/common/services/multer.config';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

@Controller()
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  //fetching vehicles by owner id
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('owner')
  @Get('vehicles')
  async getVehicles(@User() user: Webuser): Promise<VehicleResponseDto[]> {
    //console.log(user);
    return this.vehicleService.getVehicles(user.id);
  }

  //adding vehciles of a paticular owner
  @UseGuards(JwtGuard, RolesGuard)
  @Post('owner/add-vehicle')
  @Roles('owner')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'rear_picture', maxCount: 1 },
        { name: 'front_picture', maxCount: 1 },
        { name: 'side_picture', maxCount: 1 },
        { name: 'inside_picture', maxCount: 1 },
        { name: 'revenue_license', maxCount: 1 },
        { name: 'insurance_front', maxCount: 1 },
        { name: 'insurance_back', maxCount: 1 },
        { name: 'vehicle_reg', maxCount: 1 },
      ],
      multerConfigVehicle,
    ),
  )
  async addVehicle(
    @UploadedFiles()
    files: {
      rear_picture?: Express.Multer.File[];
      front_picture?: Express.Multer.File[];
      side_picture?: Express.Multer.File[];
      inside_picture?: Express.Multer.File[];
      revenue_license?: Express.Multer.File[];
      insurance_front?: Express.Multer.File[];
      insurance_back?: Express.Multer.File[];
      vehicle_reg?: Express.Multer.File[];
    },
    @User() user: Webuser,
    @Body() vehicleDto: any,
  ): Promise<any> {
    // Debug logging
    console.log('--- Add Vehicle Debug ---');
    console.log('User:', user);
    console.log('Body:', vehicleDto);
    console.log('Files:', Object.keys(files).reduce((acc, key) => ({ ...acc, [key]: files[key]?.map(f => f.originalname) }), {}));
    // Parse and convert types
    const parsedVehicleDto = {
      ...vehicleDto,
      manufactureYear: Number(vehicleDto.manufactureYear),
      no_of_seats: Number(vehicleDto.no_of_seats),
      air_conditioned:
        vehicleDto.air_conditioned === 'true' ||
        vehicleDto.air_conditioned === true,
      assistant:
        vehicleDto.assistant === 'true' || vehicleDto.assistant === true,
      route: Array.isArray(vehicleDto.route)
        ? vehicleDto.route
        : typeof vehicleDto.route === 'string'
          ? JSON.parse(vehicleDto.route)
          : [],
    };

    // Validate after parsing
    const dtoInstance = plainToInstance(CreateVehicleDto, parsedVehicleDto);
    try {
      await validateOrReject(dtoInstance);
    } catch (errors) {
      throw new BadRequestException(errors);
    }

    // Map file fields to URLs
    const rear = files.rear_picture?.[0]?.filename ?? null;
    const front = files.front_picture?.[0]?.filename ?? null;
    const side = files.side_picture?.[0]?.filename ?? null;
    const inside = files.inside_picture?.[0]?.filename ?? null;
    const revenue_license = files.revenue_license?.[0]?.filename ?? null;
    const insurance_front = files.insurance_front?.[0]?.filename ?? null;
    const insurance_back = files.insurance_back?.[0]?.filename ?? null;
    const vehicle_reg = files.vehicle_reg?.[0]?.filename ?? null;

    const vehicleData = {
      ...parsedVehicleDto,
      rear_picture_url: rear ? `uploads/vehicle/${rear}` : null,
      front_picture_url: front ? `uploads/vehicle/${front}` : null,
      side_picture_url: side ? `uploads/vehicle/${side}` : null,
      inside_picture_url: inside ? `uploads/vehicle/${inside}` : null,
      revenue_license_url: revenue_license
        ? `uploads/vehicle/${revenue_license}`
        : null,
      insurance_front_url: insurance_front
        ? `uploads/vehicle/${insurance_front}`
        : null,
      insurance_back_url: insurance_back
        ? `uploads/vehicle/${insurance_back}`
        : null,
      vehicle_reg_url: vehicle_reg ? `uploads/vehicle/${vehicle_reg}` : null,
    };

    //console.log(vehicleData,user.id);
    return this.vehicleService.addVehicle(user.id, vehicleData);
  }

  //update vehicle details of the owner
  @UseGuards(JwtGuard, RolesGuard)
  @Patch('owner/update-vehicle/:id')
  @Roles('owner')
  async updateVehicle(
    @Param('id', ParseIntPipe) id: number,
    @Body() vehicleDto: any,
  ): Promise<any> {
    //console.log(vehicleDto,id);
    return this.vehicleService.updateVehicle(id, vehicleDto);
  }

  //delete vehicle of the owner
  @UseGuards(JwtGuard, RolesGuard)
  @Delete('owner/delete-vehicle/:id')
  @Roles('owner')
  async deleteVehicle(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.vehicleService.deleteVehicle(id);
  }
}
