import { Gender } from '@prisma/client';

export class ChildDto {
  child_id!: number;
  relationship!: string;
  nearbyCity!: string;
  schoolLocation!: string;
  school!: string;
  childFirstName!: string;
  childLastName!: string;
  gender!: Gender;
  childImageUrl?: string | null;
  pickUpAddress!: string;
  schoolLatitude?: number | null;
  schoolLongitude?: number | null;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  customerId?: number | null;
  // Child model does not have createdAt/updatedAt fields in schema
}
