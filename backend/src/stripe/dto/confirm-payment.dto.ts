import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsNotEmpty()
  @IsString()
  paymentIntentId: string;
}
