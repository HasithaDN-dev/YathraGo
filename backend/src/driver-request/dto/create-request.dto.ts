import {
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateRequestDto {
  @IsInt()
  customerId: number;

  @IsEnum(['child', 'staff'])
  profileType: 'child' | 'staff';

  @IsInt()
  profileId: number;

  @IsInt()
  driverId: number;

  @IsInt()
  vehicleId: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offeredAmount?: number;

  @IsOptional()
  @IsString()
  customerNote?: string;
}
