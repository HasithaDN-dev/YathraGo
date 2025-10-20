import { IsOptional, IsEnum, IsInt } from 'class-validator';
import {
  ComplaintStatus,
  ComplaintInquiryTypes,
  ComplaintInquiryCategory,
  UserTypes,
} from '@prisma/client';
import { Type } from 'class-transformer';

export class ComplaintFilterDto {
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;

  @IsOptional()
  @IsEnum(ComplaintInquiryTypes)
  type?: ComplaintInquiryTypes;

  @IsOptional()
  @IsEnum(ComplaintInquiryCategory)
  category?: ComplaintInquiryCategory;

  @IsOptional()
  @IsEnum(UserTypes)
  senderUserType?: UserTypes;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  senderId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 20;
}
