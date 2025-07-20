import { IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterChildDto {
  @Type(() => Number)
  @IsNumber()
  customerId: number;

  @IsString()
  childName: string;

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
