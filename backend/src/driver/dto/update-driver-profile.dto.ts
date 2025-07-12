import { IsString, IsOptional } from 'class-validator';

export class UpdateDriverProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  NIC?: string;

  @IsOptional()
  @IsString()
  date_of_birth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  second_phone?: string;

  @IsOptional()
  @IsString()
  profile_picture_url?: string;
}
