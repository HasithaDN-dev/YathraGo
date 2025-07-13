import { IsString, IsOptional } from 'class-validator';

export class UploadDocumentsDto {
  @IsOptional()
  @IsString()
  driver_license_front_url?: string;

  @IsOptional()
  @IsString()
  driver_license_back_url?: string;

  @IsOptional()
  @IsString()
  nic_front_pic_url?: string;

  @IsOptional()
  @IsString()
  nic_back_pic_url?: string;

  @IsOptional()
  @IsString()
  vehicle_registration?: string;
}
