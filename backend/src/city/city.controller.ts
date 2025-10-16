import { Controller, Get, Query } from '@nestjs/common';
import { CityService } from './city.service';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  async getCities(@Query('q') q?: string) {
    return this.cityService.findAll(q);
  }
}
