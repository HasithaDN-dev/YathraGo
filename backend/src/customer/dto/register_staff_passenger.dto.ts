import { IsNumber, IsString } from 'class-validator';

export class RegisterStaffPassengerDto {
  @IsNumber()
  customerId: number;

  @IsString()
  nearbyCity: string;

  @IsString()
  workLocation: string;

  @IsString()
  workAddress: string;

  @IsString()
  pickUpLocation: string;

  @IsString()
  pickupAddress: string;
}
