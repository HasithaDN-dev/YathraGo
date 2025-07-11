import { IsString, IsInt, IsBoolean, IsArray, IsUrl } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  type: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsInt()
  manufactureYear: number;

  @IsString()
  registrationNumber: string;

  @IsString()
  color: string;

  @IsArray()
  @IsString({ each: true })
  route: string[];

  @IsInt()
  no_of_seats: number;

  @IsBoolean()
  air_conditioned: boolean;

  @IsBoolean()
  assistant: boolean;

  @IsUrl()
  rear_picture_url: string;

  @IsUrl()
  front_picture_url: string;

  @IsUrl()
  side_picture_url: string;

  @IsUrl()
  inside_picture_url: string;

  @IsUrl()
  revenue_license_url: string;

  @IsUrl()
  insurance_front_url: string;

  @IsUrl()
  insurance_back_url: string;

  @IsUrl()
  vehicle_reg_url: string;

  @IsInt()
  ownerId: number;
}
