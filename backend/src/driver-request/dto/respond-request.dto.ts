import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class RespondRequestDto {
  @IsNumber()
  driverId: number;

  @IsEnum(['ACCEPT', 'REJECT', 'COUNTER'])
  action: 'ACCEPT' | 'REJECT' | 'COUNTER';

  @ValidateIf((o: RespondRequestDto) => o.action === 'COUNTER')
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
