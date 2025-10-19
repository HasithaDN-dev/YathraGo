import { Controller, Get, Query, ParseIntPipe, Param } from '@nestjs/common';
import { FindVehicleService } from './find-vehicle.service';
import { SearchVehicleDto } from './dto';

@Controller('find-vehicle')
export class FindVehicleController {
  constructor(private readonly findVehicleService: FindVehicleService) {}

  @Get('search')
  async searchVehicles(@Query() searchDto: SearchVehicleDto) {
    return this.findVehicleService.searchVehicles(searchDto);
  }

  @Get('profiles')
  async getCustomerProfiles(
    @Query('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.findVehicleService.getCustomerProfiles(customerId);
  }

  @Get('details/:driverId')
  async getVehicleDetails(@Param('driverId', ParseIntPipe) driverId: number) {
    return this.findVehicleService.getVehicleDetails(driverId);
  }
}
