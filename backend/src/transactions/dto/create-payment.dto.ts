// src/transactions/dto/create-payment.dto.ts

import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsEnum,
  IsDate,
  IsBoolean,
  Min,
  Max,
  IsString,
  IsObject,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { ChildPaymentStatus } from '@prisma/client';
import { Type } from 'class-transformer';

/**
 * DTO for a single ChildPayment record.
 * This matches all the columns you'd want to set initially.
 */
export class CreateChildPaymentDto {
  @IsInt()
  @IsOptional()
  rideRequestId?: number;

  @IsInt()
  @IsNotEmpty()
  childId: number;

  @IsInt()
  @IsNotEmpty()
  driverId: number;

  @IsInt()
  @IsNotEmpty()
  customerId: number;

  @IsInt()
  @Min(1)
  @Max(12)
  paymentMonth: number;

  @IsInt()
  @Min(2020)
  paymentYear: number;

  @IsNumber()
  @IsPositive()
  baseMonthlyPrice: number;

  @IsBoolean()
  @IsOptional()
  isAdjusted?: boolean;

  @IsNumber()
  @IsOptional()
  adjustmentPercent?: number;

  @IsNumber()
  @IsOptional()
  adjustedPrice?: number;

  @IsString()
  @IsOptional()
  adjustmentReason?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  adjustmentDate?: Date;

  @IsNumber()
  @IsPositive()
  finalPrice: number; // Make this required for initial creation

  @IsNumber()
  @IsOptional()
  amountPaid?: number;

  @IsEnum(ChildPaymentStatus)
  @IsOptional()
  paymentStatus?: ChildPaymentStatus;

  @IsObject()
  @IsOptional()
  paymentEvents?: any;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  gracePeriodEndDate?: Date;

  @IsBoolean()
  @IsOptional()
  isPrepaid?: boolean;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  transactionRef?: string;

  @IsNumber()
  @IsOptional()
  carryForwardDue?: number;

  // createdAt and updatedAt are handled by the database
}

/**
 * Wrapper DTO to accept an array of payment records.
 * This is what your controller will receive in its body.
 */
export class CreateMultipleChildPaymentsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChildPaymentDto)
  records: CreateChildPaymentDto[];
}
