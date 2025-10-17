// src/driver/dto/complete-driver-registration.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsDateString,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsInt,
  IsBoolean,
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

  // Vehicle Information (added for driver registration with vehicle)
  @ApiProperty({ description: 'Vehicle type', required: false })
  @IsString()
  @IsOptional()
  vehicleType?: string;

  @ApiProperty({ description: 'Vehicle brand', required: false })
  @IsString()
  @IsOptional()
  vehicleBrand?: string;

  @ApiProperty({ description: 'Vehicle model', required: false })
  @IsString()
  @IsOptional()
  vehicleModel?: string;

  @ApiProperty({ description: 'Year of manufacture', required: false })
  @IsString()
  @IsOptional()
  yearOfManufacture?: string;

  @ApiProperty({ description: 'Vehicle color', required: false })
  @IsString()
  @IsOptional()
  vehicleColor?: string;

  @ApiProperty({ description: 'License plate number', required: false })
  @IsString()
  @IsOptional()
  licensePlate?: string;

  @ApiProperty({ description: 'Number of seats', required: false })
  @IsInt()
  @IsOptional()
  seats?: number;

  @ApiProperty({ description: 'Female assistant available', required: false })
  @IsBoolean()
  @IsOptional()
  femaleAssistant?: boolean;

  // Vehicle Image URLs
  @ApiProperty({ description: 'Vehicle front view URL', required: false })
  @IsString()
  @IsOptional()
  vehicleFrontView?: string;

  @ApiProperty({ description: 'Vehicle side view URL', required: false })
  @IsString()
  @IsOptional()
  vehicleSideView?: string;

  @ApiProperty({ description: 'Vehicle rear view URL', required: false })
  @IsString()
  @IsOptional()
  vehicleRearView?: string;

  @ApiProperty({ description: 'Vehicle interior view URL', required: false })
  @IsString()
  @IsOptional()
  vehicleInteriorView?: string;

  @ApiProperty({ description: 'Revenue license URL', required: false })
  @IsString()
  @IsOptional()
  revenueLicenseUrl?: string;

  @ApiProperty({ description: 'Vehicle insurance URL', required: false })
  @IsString()
  @IsOptional()
  vehicleInsuranceUrl?: string;

  @ApiProperty({
    description: 'Vehicle registration document URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  registrationDocUrl?: string;
}
