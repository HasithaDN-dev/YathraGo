export interface User {
  id?: number;
  phone: string;
  userType: string;
  isVerified: boolean;
  isNewUser: boolean;
  registrationStatus?: string;
}

export interface Profile {
  driver_id: number;
  name: string;
  phone: string;
  email?: string;
  status: string;
  registrationStatus: string;
  NIC?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  profile_picture_url?: string;
}