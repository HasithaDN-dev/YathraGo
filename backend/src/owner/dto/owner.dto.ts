import { IsString, IsOptional, IsEmail } from 'class-validator';

export class OwnerDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  address: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  companyName: string;
}
