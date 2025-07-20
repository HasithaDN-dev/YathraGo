import {
  IsString,
  IsInt,
  IsBoolean,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsInt()
  @IsNotEmpty()
  manufactureYear: number;

  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  route: string[];

  @IsInt()
  @IsNotEmpty()
  no_of_seats: number;

  @IsBoolean()
  @IsNotEmpty()
  air_conditioned: boolean;

  @IsBoolean()
  @IsNotEmpty()
  assistant: boolean;
}
