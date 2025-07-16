// src/driver/dto/complete-driver-registration.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsDateString,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteDriverRegistrationDto {
  // Personal Details
  @ApiProperty({ description: 'Full name of the driver' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'National Identity Card number' })
  @IsString()
  @IsNotEmpty()
  NIC: string;

  @ApiProperty({ description: 'Current residential address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: '1990-01-15',
    description: 'Date of birth in YYYY-MM-DD format',
  })
  @IsDateString()
  @IsNotEmpty()
  date_of_birth: string; // Will be converted to Date object in service

  @ApiProperty({
    description: 'Gender of the driver (e.g., Male, Female, Other)',
  })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ description: "URL to the driver's profile picture" })
  @IsUrl()
  @IsNotEmpty()
  profile_picture_url: string;

  @ApiProperty({
    description:
      "Driver's email address (optional, uniqueness checked in service)",
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  // Driver Document/Contact Details
  @ApiProperty({ description: 'URL to the front image of the driver license' })
  @IsUrl()
  @IsNotEmpty()
  driver_license_front_url: string;

  @ApiProperty({ description: 'URL to the back image of the driver license' })
  @IsUrl()
  @IsNotEmpty()
  driver_license_back_url: string;

  @ApiProperty({ description: 'URL to the front image of the NIC' })
  @IsUrl()
  @IsNotEmpty()
  nic_front_pic_url: string;

  @ApiProperty({ description: 'URL to the back image of the NIC' })
  @IsUrl()
  @IsNotEmpty()
  nice_back_pic_url: string;

  @ApiProperty({ description: 'Secondary contact number (optional)' })
  @IsOptional()
  @IsPhoneNumber('LK') // Assuming Sri Lankan phone numbers, adjust as needed
  second_phone?: string;

  @ApiProperty({
    description:
      'Vehicle Registration Number (optional, will be linked in Stage 3)',
    required: false,
  })
  @IsString()
  @IsOptional()
  vehicle_Reg_No?: string; // This field is present in your Driver model
}
