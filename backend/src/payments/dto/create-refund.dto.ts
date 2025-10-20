import { IsInt, IsNumber, IsString, IsEnum } from 'class-validator';
import { RefundType, UserTypes } from '@prisma/client';

export class CreateRefundDto {
  @IsInt()
  paymentId: number;

  @IsInt()
  childId: number;

  @IsInt()
  customerId: number;

  @IsInt()
  driverId: number;

  @IsNumber()
  refundAmount: number;

  @IsString()
  refundReason: string;

  @IsEnum(RefundType)
  refundType: RefundType;

  @IsInt()
  requestedBy: number;

  @IsEnum(UserTypes)
  requestedByType: UserTypes;
}
