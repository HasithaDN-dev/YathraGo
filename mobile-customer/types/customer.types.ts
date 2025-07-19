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
export type ProfileType = 'parent' | 'child' | 'staff';

export interface Profile {
  id: string;
  name: string;
  type: ProfileType;
  // Parent-specific
  children?: ChildProfile[];
  staffPassenger?: StaffProfile;
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
  childName: string;
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

export interface CustomerProfileData {
  name: string;
  email: string;
  address: string;
  emergencyContact: string;
  profileImageUrl?: string;
}

export interface ChildProfileData {
  childName: string;
  relationship: string;
  school: string;
  nearbyCity: string;
  schoolLocation: string;
  pickUpAddress: string;
  childImageUrl?: string;
}

export interface StaffProfileData {
  nearbyCity: string;
  workLocation: string;
  workAddress: string;
  pickUpLocation: string;
  pickupAddress: string;
}
