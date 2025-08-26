import { IsString, IsOptional, IsEmail, IsInt, IsEnum } from 'class-validator';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Unspecified = 'Unspecified',
}

export class CustomerRegisterDto {
  @IsInt()
  customerId: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

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
