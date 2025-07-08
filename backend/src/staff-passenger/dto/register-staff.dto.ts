import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterStaffDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters.' })
  @MaxLength(50, { message: 'Name must be at most 50 characters.' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;

  @IsString()
  @MinLength(10, { message: 'Contact number must be exactly 10 digits.' })
  @MaxLength(10, { message: 'Contact number must be exactly 10 digits.' })
  @Matches(/^0\d{9}$/, {
    message: 'Contact number must start with 0 and contain exactly 10 digits.',
  })
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
