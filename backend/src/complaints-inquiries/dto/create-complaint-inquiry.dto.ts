import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import {
  UserTypes,
  ComplaintInquiryTypes,
  ComplaintInquiryCategory,
} from '@prisma/client';

export class CreateComplaintInquiryDto {
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
}
