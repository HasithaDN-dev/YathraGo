import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ComplaintStatus } from '@prisma/client';

export class UpdateComplaintDto {
  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: ComplaintStatus;

  @IsString()
  @IsOptional()
  resolution?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
