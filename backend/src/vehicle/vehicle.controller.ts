import { Body, Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VehicleService } from './vehicle.service';
import { User } from 'src/auth-web/decorators';
import {  Webuser } from '@prisma/client';
import { JwtGuard } from 'src/auth-web/guards';
import { RolesGuard } from 'src/auth-web/guards/roles.guards';
import { Roles } from 'src/auth-web/decorators/roles.decorator';
import { CreateVehicleDto, VehicleResponseDto } from './dto';

@Controller()
export class VehicleController {

    constructor(private vehicleService: VehicleService) {}

    //fetching vehicles by owner id
        @UseGuards(JwtGuard,RolesGuard)
        @Get('owner/vehicles')
        @Roles('owner')
        async getVehicles(@User() user: Webuser): Promise<VehicleResponseDto[]> {
            return this.vehicleService.getVehicles(user.id);
        }

    //adding vehciles of a paticular owner
        @UseGuards(JwtGuard,RolesGuard)
        @Get('owner/vehicle')
        @Roles('owner')
        async addVehicle(@User() user: Webuser,@Body() vehicleDto: CreateVehicleDto): Promise<CreateVehicleDto> {
            return this.vehicleService.addVehicle(user.id,vehicleDto);
        }

    



  
}
