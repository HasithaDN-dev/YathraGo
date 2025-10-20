import { IsNotEmpty, IsNumber, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateRequestDto {
  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['child', 'staff'])
  profileType: 'child' | 'staff';

  @IsNotEmpty()
  @IsNumber()
  profileId: number;

  @IsNotEmpty()
  @IsNumber()
  driverId: number;

  @IsOptional()
  @IsNumber()
  offeredAmount?: number;

  @IsOptional()
  @IsString()
  customerNote?: string;
}

export class CounterOfferDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class RespondRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['ACCEPT', 'REJECT', 'COUNTER'])
  action: 'ACCEPT' | 'REJECT' | 'COUNTER';

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class RequestResponseDto {
  id: number;
  customerID: number;
  customerName: string;
  profileType: 'child' | 'staff';
  profileId: number;
  profileName: string;
  driverId: number;
  driverName: string;
  vehicleInfo: string;
  estimatedDistance: number;
  estimatedPrice: number;
  currentAmount: number;
  status: string;
  customerNote?: string | null;
  driverNote?: string | null;
  lastModifiedBy?: string | null;
  nearestPickupCityName?: string | null;
  nearestDropCityName?: string | null;
  negotiationHistory: NegotiationHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NegotiationHistoryItem {
  offeredBy: 'customer' | 'driver';
  amount: number;
  note?: string;
  timestamp: string;
  action: 'COUNTER' | 'ACCEPT' | 'REJECT';
}
