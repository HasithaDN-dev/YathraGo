// src/transactions/dto/submit-payment.dto.ts

import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// This class defines the structure for a single month entry
class MonthYearDto {
  @IsInt()
  @Min(2020)
  year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}

// This is the main DTO for the entire request body
export class SubmitMonthsForPaymentDto {
  @IsInt()
  @IsNotEmpty()
  childId: number;

  @IsArray()
  // This ensures that every item in the 'months' array is validated
  @ValidateNested({ each: true })
  // This tells class-validator what type the array items are
  @Type(() => MonthYearDto)
  months: MonthYearDto[];
}
