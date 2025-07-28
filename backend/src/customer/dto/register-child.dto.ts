import { IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterChildDto {
  @Type(() => Number)
  @IsNumber()
  customerId: number;

  @IsString()
  childFirstName: string;

  @IsString()
  childLastName: string;

  @IsString()
  gender: string;

  @IsString()
  relationship: string;

  @IsString()
  nearbyCity: string;

  @IsString()
  schoolLocation: string;

  @IsString()
  school: string;

  @IsString()
  pickUpAddress: string;

  @IsOptional()
  @IsString()
  childImageUrl?: string;
}
