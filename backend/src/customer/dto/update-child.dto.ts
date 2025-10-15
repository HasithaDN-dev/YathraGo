import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Unspecified = 'Unspecified',
}

export class UpdateChildDto {
  @IsOptional()
  @IsString()
  childFirstName?: string;

  @IsOptional()
  @IsString()
  childLastName?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsOptional()
  @IsString()
  nearbyCity?: string;

  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsString()
  schoolLocation?: string;

  @IsOptional()
  @IsString()
  pickUpAddress?: string;

  @IsOptional()
  @IsString()
  childImageUrl?: string;

  @IsOptional()
  @IsNumber()
  schoolLatitude?: number;

  @IsOptional()
  @IsNumber()
  schoolLongitude?: number;

  @IsOptional()
  @IsNumber()
  pickupLatitude?: number;

  @IsOptional()
  @IsNumber()
  pickupLongitude?: number;
}
