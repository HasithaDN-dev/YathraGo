import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CounterOfferDto {
  @IsNumber()
  customerId: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  note?: string;
}
