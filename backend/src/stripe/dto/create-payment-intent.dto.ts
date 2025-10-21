import { IsNotEmpty, IsNumber, IsArray, IsString, IsOptional, ArrayMinSize } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNotEmpty()
  @IsNumber()
  childId: number;

  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  paymentIds: number[];

  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
