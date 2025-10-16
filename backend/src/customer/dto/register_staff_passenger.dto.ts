import { IsNumber, IsString, IsOptional } from 'class-validator';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Unspecified = 'Unspecified',
}

export class RegisterStaffPassengerDto {
  @IsNumber()
  customerId: number;

  @IsString()
  nearbyCity: string;

  @IsString()
  workLocation: string;

  @IsString()
  workAddress: string;

  @IsOptional()
  @IsNumber()
  workLatitude?: number;

  @IsOptional()
  @IsNumber()
  workLongitude?: number;

  @IsString()
  pickUpLocation: string;

  @IsString()
  pickupAddress: string;

  @IsOptional()
  @IsNumber()
  pickupLatitude?: number;

  @IsOptional()
  @IsNumber()
  pickupLongitude?: number;
}
