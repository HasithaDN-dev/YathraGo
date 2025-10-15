import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CityService } from './city.service';

@ApiTags('Cities')
@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cities in the database' })
  @ApiResponse({
    status: 200,
    description: 'Returns all cities',
    schema: {
      example: {
        success: true,
        count: 2,
        data: [
          {
            id: 1,
            name: 'Colombo',
            latitude: 6.9271,
            longitude: 79.8612,
          },
          {
            id: 2,
            name: 'Kandy',
            latitude: 7.2906,
            longitude: 80.6337,
          },
        ],
      },
    },
  })
  findAll() {
    return this.cityService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific city by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the city data',
    schema: {
      example: {
        success: true,
        data: {
          id: 1,
          name: 'Colombo',
          latitude: 6.9271,
          longitude: 79.8612,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'City not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cityService.findOne(id);
  }
}
