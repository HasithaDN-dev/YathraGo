export interface ChildRegistration {
  customerId: number;
  childName: string;
  relationship: string;
  nearbyCity: string;
  schoolLocation: string;
  school: string;
  pickUpAddress: string;
  childImageUrl?: string;
}

// Registration types based on the DTOs
export interface StaffPassengerRegistration {
  customerId: number;
  nearbyCity: string;
  workLocation: string;
  workAddress: string;
  pickUpLocation: string;
  pickupAddress: string;
}

// Customer Registration interface
export interface CustomerRegistration {
  customerId: number;
  name: string;
  email?: string;
  address?: string;
  profileImageUrl?: string;
  emergencyContact?: string;
}

export type RegistrationType = 'staff' | 'child';

export interface RegistrationResponse {
  success: boolean;
  message: string;
}
