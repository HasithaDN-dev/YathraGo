import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VehicleService } from './vehicle.service';
import { User } from 'src/auth-web/decorators';
import {  Webuser } from '@prisma/client';
import { JwtGuard } from 'src/auth-web/guards';
import { RolesGuard } from 'src/auth-web/guards/roles.guards';
import { Roles } from 'src/auth-web/decorators/roles.decorator';

@Controller()
export class VehicleController {

    constructor(private vehicleService: VehicleService) {}

        @UseGuards(JwtGuard,RolesGuard)
        @Get('owner/vehicles')
        @Roles('owner')
        getVehicles(@User() user:Webuser){
            return this.vehicleService.getVehicles(user.id);
           //return req.user
        }

    



  
}
