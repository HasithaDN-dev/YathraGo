import { IsEnum, IsOptional } from 'class-validator';
import { ComplaintStatus } from '@prisma/client';

export class UpdateComplaintInquiryDto {
  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: ComplaintStatus;
}
