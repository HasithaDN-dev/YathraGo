import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsEnum,
  IsDate,
} from 'class-validator';
import { ChildPaymentStatus } from '@prisma/client';

export class TransactionsDto {
  @IsInt()
  childId: number;

  @IsString()
  @IsOptional()
  childName?: string;

  @IsOptional()
  @IsDate()
  paymentDate?: Date;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  transactionRef?: string;

  // Show the amount to display in UI:
  @IsPositive()
  paymentAmount: number;

  @IsEnum(ChildPaymentStatus)
  paymentStatus: ChildPaymentStatus;
}
