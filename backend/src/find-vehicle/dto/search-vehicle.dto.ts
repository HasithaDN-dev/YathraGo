import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchVehicleDto {
  @IsNumber()
  @Type(() => Number)
  customerId: number;

  @IsOptional()
  @IsString()
  profileType?: 'child' | 'staff'; // 'child' or 'staff'

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  profileId?: number; // childId or staffPassengerId

  @IsOptional()
  @IsString()
  vehicleType?: string; // 'Van' or 'Bus' or null for all

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  minRating?: number; // minimum driver rating filter
}
