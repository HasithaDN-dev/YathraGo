import { IsOptional, IsEnum, IsInt, IsString } from 'class-validator';
import { ChildPaymentStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class PaymentFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  driverId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customerId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  childId?: number;

  @IsOptional()
  @IsEnum(ChildPaymentStatus)
  status?: ChildPaymentStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  paymentMonth?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  paymentYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 20;
}
