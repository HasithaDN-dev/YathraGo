// Driver-specific types for the mobile driver app

export interface Driver {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  profileImageUrl?: string;
  emergencyContact?: string;
  status: string;
  registrationStatus: DriverRegistrationStatus;
  isProfileComplete?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DriverRegistrationStatus = 
  | 'OTP_PENDING'
  | 'OTP_VERIFIED'
  | 'ACCOUNT_CREATED'
  | 'HAVING_A_PROFILE';

export interface DriverProfileData {
  name: string;
  email?: string;
  address?: string;
  profileImageUrl?: string;
  emergencyContact?: string;
}

export interface DriverRegistrationData {
  driverId: number;
  name: string;
  email?: string;
  address?: string;
  profileImageUrl?: string;
  emergencyContact?: string;
  NIC: string;
  dateOfBirth: string;
  gender: string;
  secondPhone?: string;
}

export interface VehicleData {
  type: string;
  brand: string;
  model: string;
  manufactureYear: number;
  registrationNumber: string;
  color: string;
  route: string[];
  noOfSeats: number;
  airConditioned: boolean;
  assistant: boolean;
  rearPictureUrl: string;
  frontPictureUrl: string;
  sidePictureUrl: string;
  insidePictureUrl: string;
  revenueLicenseUrl?: string;
  insuranceFrontUrl?: string;
  insuranceBackUrl?: string;
  vehicleRegUrl?: string;
}

export interface DocumentUploadData {
  frontImage: any;
  backImage: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    phone: string;
    userType: 'DRIVER';
    isVerified: boolean;
    isNewUser: boolean;
    registrationStatus?: string;
  };
}
