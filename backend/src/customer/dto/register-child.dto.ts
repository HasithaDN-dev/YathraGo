import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Unspecified = 'Unspecified',
}

export class RegisterChildDto {
  @IsNumber()
  customerId: number;

  @IsString()
  childFirstName: string;

  @IsString()
  childLastName: string;

  @IsEnum(Gender)
  gender: Gender;

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
