import { Controller, Get } from '@nestjs/common';
import { CityService } from './city.service';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  async getCities() {
    return await this.cityService.getAllCities();
  }
}
