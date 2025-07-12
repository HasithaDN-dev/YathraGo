import { IsString, Length, IsEnum, Matches } from 'class-validator';
import { UserType } from '@prisma/client';

export class SendOtpDto {
  @IsString()
  @Matches(/^\+94[0-9]{9}$/, {
    message: 'Phone number must be in format +94XXXXXXXXX (9 digits after +94)',
  })
  phone: string;

  @IsEnum(UserType)
  userType: UserType;
}

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\+94[0-9]{9}$/, {
    message: 'Phone number must be in format +94XXXXXXXXX (9 digits after +94)',
  })
  phone: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^[0-9]{6}$/, { message: 'OTP must contain only numbers' })
  otp: string;

  @IsEnum(UserType)
  userType: UserType;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  isNewUser: boolean;
}
