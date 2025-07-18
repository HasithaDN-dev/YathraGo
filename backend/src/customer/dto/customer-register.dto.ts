import { IsString, IsOptional, IsEmail, IsInt } from 'class-validator';

export class CustomerRegisterDto {
  @IsInt()
  customerId: number;

  @IsString()
  name: string;

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
