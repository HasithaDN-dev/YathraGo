import { IsNotEmpty, IsString, IsInt, IsEnum, IsOptional } from 'class-validator';
import { ComplaintInquiryTypes, ComplaintInquiryCategory, UserTypes } from '@prisma/client';

export class CreateComplaintDto {
  @IsInt()
  @IsNotEmpty()
  senderId: number;

  @IsEnum(UserTypes)
  @IsNotEmpty()
  senderUserType: UserTypes;

  @IsEnum(ComplaintInquiryTypes)
  @IsNotEmpty()
  type: ComplaintInquiryTypes;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ComplaintInquiryCategory)
  @IsNotEmpty()
  category: ComplaintInquiryCategory;

  @IsString()
  @IsOptional()
  subject?: string;
}
