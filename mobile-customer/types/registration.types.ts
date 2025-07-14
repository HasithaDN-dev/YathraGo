export interface ChildRegistration {
  customerId: number;
  childName: string;
  relationship: string;
  nearbyCity: string;
  schoolLocation: string;
  school: string;
  pickUpAddress: string;
  childImageUrl?: string;
  parentImageUrl?: string;
  emergencyContact: string;
  parentName: string;
  parentEmail: string;
  parentAddress: string;
}
// Registration types based on the DTOs
export interface StaffPassengerRegistration {
  customerId: number;
  nearbyCity: string;
  workLocation: string;
  workAddress: string;
  pickUpLocation: string;
  pickupAddress: string;
  name: string;
  email: string;
  address: string;
  profileImageUrl?: string;
  emergencyContact?: string;
}

export type RegistrationType = 'staff';

export interface RegistrationResponse {
  success: boolean;
  message: string;
}
