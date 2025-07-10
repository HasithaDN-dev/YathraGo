import { IsNumber, IsString, IsOptional, IsEmail } from 'class-validator';

export class RegisterStaffPassengerDto {
  @IsNumber()
  customerId: number;

  @IsString()
  nearbyCity: string;

  @IsString()
  workLocation: string;

  @IsString()
  workAddress: string;

  @IsString()
  pickUpLocation: string;

  @IsString()
  pickupAddress: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;
}
