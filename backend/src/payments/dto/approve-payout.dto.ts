import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class ApprovePayoutDto {
  @IsInt()
  driverId: number;

  @IsInt()
  paymentMonth: number;

  @IsInt()
  paymentYear: number;

  @IsNumber()
  payoutAmount: number;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
