import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class RegisterStaffDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters.' })
  @MaxLength(50, { message: 'Name must be at most 50 characters.' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;

  @IsString()
  contact: string;

  @IsString()
  nearbyCity: string;

  @IsString()
  workLocation: string;

  @IsString()
  workAddress: string;

  @IsString()
  pickUpLocation: string;

  @IsString()
  pickupAddress: string;
}
