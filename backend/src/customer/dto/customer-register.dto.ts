import { IsString, IsOptional, IsEmail, IsInt } from 'class-validator';

export class CustomerRegisterDto {
  @IsInt()
  customerId: number;

  @IsString()
  firstName: string;

  @IsString()
  LastName: string;

  @IsString()
  gender: string;

  @IsString()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;
}
