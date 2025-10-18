import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateStaffDto {
  @IsOptional()
  @IsString()
  nearbyCity?: string;

  @IsOptional()
  @IsString()
  workLocation?: string;

  @IsOptional()
  @IsString()
  workAddress?: string;

  @IsOptional()
  @IsString()
  pickUpLocation?: string;

  @IsOptional()
  @IsString()
  pickupAddress?: string;

  @IsOptional()
  @IsNumber()
  workLatitude?: number;

  @IsOptional()
  @IsNumber()
  workLongitude?: number;

  @IsOptional()
  @IsNumber()
  pickupLatitude?: number;

  @IsOptional()
  @IsNumber()
  pickupLongitude?: number;
}
