// In: types/index.ts

// The user object returned from the backend after login
export interface User {
  id: string;
  phone: string;
  isProfileComplete: boolean;
}

// The shape of the authentication response from your NestJS backend
export interface AuthResponse {
  token: string;
  user: User;
}

// The shape for a single profile (parent or child)
export interface Profile {
  id: string;
  name: string;
  type: 'parent' | 'child';
  // Add any other relevant fields, e.g., school, office location
}
