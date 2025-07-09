import { IsString, IsPhoneNumber, Length, IsEnum } from 'class-validator';
import { UserType } from '@prisma/client';

export class SendOtpDto {
  @IsPhoneNumber()
  phone: string;

  @IsEnum(UserType)
  userType: UserType;
}

export class VerifyOtpDto {
  @IsPhoneNumber()
  phone: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

  @IsEnum(UserType)
  userType: UserType;
}
