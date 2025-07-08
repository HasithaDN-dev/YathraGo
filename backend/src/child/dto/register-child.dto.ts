import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsInt,
  IsNotEmpty,
} from 'class-validator';

export class RegisterChildDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  staffPassengerId: number;

  @IsString()
  @MinLength(2, { message: 'Child name must be at least 2 characters.' })
  @MaxLength(50, { message: 'Child name must be at most 50 characters.' })
  childName: string;

  @IsOptional()
  childImageUrl?: string;

  @IsString()
  relationship: string;

  @IsString()
  NearbyCity: string;

  @IsString()
  schoolLocation: string;

  @IsString()
  school: string;

  @IsString()
  pickUpAddress: string;
}
