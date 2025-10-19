import { RequestStatus } from '@prisma/client';
import { ChildDto } from './child.dto';

export class CustomerMiniDto {
  customer_id!: number;
  firstName!: string;
  lastName!: string;
  phone!: string;
  email?: string | null;
  profileImageUrl?: string | null;
}

export class RideRequestPassengerDto {
  rideRequestId!: number;
  childId!: number;
  driverId!: number;
  createdAt!: Date;
  updatedAt!: Date;
  Amount?: number | null;
  AssignedDate?: Date | null;
  Estimation?: number | null;
  status!: RequestStatus;
  child!: ChildDto;
  customer?: CustomerMiniDto;
}
