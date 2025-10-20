import { IsInt, IsNumber, IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ChildPaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @IsInt()
  childId: number;

  @IsInt()
  driverId: number;

  @IsInt()
  customerId: number;

  @IsInt()
  paymentMonth: number;

  @IsInt()
  paymentYear: number;

  @IsNumber()
  baseMonthlyPrice: number;

  @IsNumber()
  finalPrice: number;

  @IsOptional()
  @IsBoolean()
  isPrepaid?: boolean;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  transactionRef?: string;
}
