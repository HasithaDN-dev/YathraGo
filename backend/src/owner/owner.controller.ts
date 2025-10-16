import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  Put,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { Roles, User } from 'src/auth-web/decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerService } from './owner.service';
import { OwnerDto } from './dto/owner.dto';
import { JwtGuard, RolesGuard } from 'src/auth-web/guards';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerConfigDriver } from 'src/common/services/multer.config';
import { CreateDriverDto } from 'src/driver/dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { Webuser } from '@prisma/client';

@Controller('owner')
export class OwnerController {
  constructor(private ownerService: OwnerService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('owner')
  @Get('profile')
  async getProfile(@User() user: any): Promise<OwnerDto | null> {
    // console.log('webuser:', user);
    return this.ownerService.getOwnerProfile(user.id);
    //console.log('vehicleOwner:', owner);
    //return owner;
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('owner')
  @Put('update-profile')
  async updateProfile(
    @User() user: any,
    @Body() updateData: any,
  ): Promise<OwnerDto | null> {
    return this.ownerService.updateOwnerProfile(user.id, updateData);
  }

  // --- ADD DRIVER ENDPOINT ---
  @UseGuards(JwtGuard, RolesGuard)
  @Post('add-driver')
  @Roles('owner')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'id_front', maxCount: 1 },
        { name: 'id_back', maxCount: 1 },
        { name: 'license_front', maxCount: 1 },
        { name: 'license_back', maxCount: 1 },
      ],
      multerConfigDriver,
    ),
  )
  async addDriver(
    @UploadedFiles()
    files: {
      id_front?: Express.Multer.File[];
      id_back?: Express.Multer.File[];
      license_front?: Express.Multer.File[];
      license_back?: Express.Multer.File[];
    },
    @User() user: Webuser,
    @Body() driverDto: any,
  ): Promise<any> {
    // Debug logging
    console.log('--- Add Driver Debug ---');
    console.log('User:', user);
    console.log('Body:', driverDto);
    console.log(
      'Files:',
      Object.keys(files).reduce(
        (acc, key) => ({
          ...acc,
          [key]: files[key]?.map((f) => f.originalname),
        }),
        {},
      ),
    );

    // Parse and convert types
    const parsedDriverDto = {
      ...driverDto,
      date_of_birth: driverDto.date_of_birth,
    };

    // Validate after parsing
    const dtoInstance = plainToInstance(CreateDriverDto, parsedDriverDto);
    try {
      await validateOrReject(dtoInstance);
    } catch (errors) {
      throw new BadRequestException(errors);
    }

    // Map file fields to URLs
    const id_front = files.id_front?.[0]?.filename ?? null;
    const id_back = files.id_back?.[0]?.filename ?? null;
    const license_front = files.license_front?.[0]?.filename ?? null;
    const license_back = files.license_back?.[0]?.filename ?? null;

    const driverData = {
      ...parsedDriverDto,
      nic_front_pic_url: id_front ? `uploads/driver/${id_front}` : '',
      nice_back_pic_url: id_back ? `uploads/driver/${id_back}` : '',
      driver_license_front_url: license_front
        ? `uploads/driver/${license_front}`
        : '',
      driver_license_back_url: license_back
        ? `uploads/driver/${license_back}`
        : '',
      profile_picture_url: '', // Default empty for owner-created drivers
    };

    return this.ownerService.addDriver(driverData);
  }

  // --- GET ALL DRIVERS ENDPOINT ---
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('owner')
  @Get('drivers')
  async getDrivers(@User() user: Webuser): Promise<any> {
    return this.ownerService.getAllDrivers();
  }
}
