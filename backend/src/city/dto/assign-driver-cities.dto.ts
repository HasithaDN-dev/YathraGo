import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, IsInt } from 'class-validator';

export class AssignDriverCitiesDto {
  @ApiProperty({
    description: 'Array of city IDs to assign to the driver',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one city must be assigned' })
  @IsInt({ each: true })
  cityIds: number[];
}
