// Unified customer, profile, and registration types for the mobile app

// --- User and Auth ---
export interface User {
  id: string;
  phone: string;
  isProfileComplete: boolean;
  // Add more fields as needed
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// --- Profile and Registration ---
export type ProfileType = 'child' | 'staff';

export type Gender = 'Male' | 'Female' | 'Unspecified';

export interface Profile {
  id: string;
  /**
   * Display name for the profile (e.g., child name or staff label).
   * Optional because not all backend shapes provide a single name field.
   */
  name?: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  type: ProfileType;
  // Child-specific
  relationship?: string;
  school?: string;
  nearbyCity?: string;
  schoolLocation?: string;
  pickUpAddress?: string;
  childImageUrl?: string;
  // Staff-specific
  workLocation?: string;
  workAddress?: string;
  pickUpLocation?: string;
  pickupAddress?: string;
  // Common fields
  email?: string;
  address?: string;
  emergencyContact?: string;
  profileImageUrl?: string;
}

export interface ChildProfile {
  id: string;
  childFirstName: string;
  childLastName: string;
  gender: Gender;
  relationship: string;
  school: string;
  nearbyCity: string;
  schoolLocation: string;
  pickUpAddress: string;
  childImageUrl?: string;
  type: 'child';
}

export interface StaffProfile {
  id: string;
  nearbyCity: string;
  workLocation: string;
  workAddress: string;
  pickUpLocation: string;
  pickupAddress: string;
  type: 'staff';
}

// For customer-register, only phone is guaranteed (from OTP step), rest are optional for profile completion
export interface CustomerProfileData {
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  email?: string;
  address?: string;
  emergencyContact?: string;
  profileImageUrl?: string;
}

export interface ChildProfileData {
  childFirstName: string;
  childLastName: string;
  gender: Gender;
  relationship: string;
  school: string;
  nearbyCity: string;
  schoolLocation: string;
  pickUpAddress: string;
  childImageUrl?: string;
  customerId?: string; // Optional since we add it in the API
}

export interface StaffProfileData {
  nearbyCity: string;
  workLocation: string;
  workAddress: string;
  pickUpLocation: string;
  pickupAddress: string;
  // Enhanced location details
  workLocationDetails?: import('./location.types').LocationDetails;
  pickupLocationDetails?: import('./location.types').LocationDetails;
  customerId?: string; // Optional since we add it in the API
}
