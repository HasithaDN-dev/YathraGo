export interface NegotiationHistoryItem {
  offeredBy: 'customer' | 'driver';
  amount: number;
  note?: string;
  timestamp: string;
  action?: 'ACCEPT' | 'REJECT' | 'COUNTER';
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
  customerNote?: string;
  driverNote?: string;
  lastModifiedBy?: string;
  nearestPickupCityName?: string;
  nearestDropCityName?: string;
  negotiationHistory: NegotiationHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}
