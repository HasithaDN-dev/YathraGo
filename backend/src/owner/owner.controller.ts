import { Controller, Get, UseGuards, Body, Put } from '@nestjs/common';
import { Roles, User } from 'src/auth-web/decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerService } from './owner.service';
import { OwnerDto } from './dto/owner.dto';
import { JwtGuard, RolesGuard } from 'src/auth-web/guards';

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
  async updateProfile(@User() user: any, @Body() updateData: any): Promise<OwnerDto | null> {
    return this.ownerService.updateOwnerProfile(user.id, updateData);
  }
}
