import { API_BASE_URL } from '../../config/api';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  gender?: 'Male' | 'Female' | 'Unspecified';
  email?: string;
  address?: string;
  profileImageUrl?: string;
  emergencyContact?: string;
}

export interface UpdateChildData {
  childFirstName?: string;
  childLastName?: string;
  gender?: 'Male' | 'Female' | 'Unspecified';
  relationship?: string;
  nearbyCity?: string;
  school?: string;
  schoolLocation?: string;
  pickUpAddress?: string;
  childImageUrl?: string;
  schoolLatitude?: number;
  schoolLongitude?: number;
  pickupLatitude?: number;
  pickupLongitude?: number;
}

export interface UpdateStaffData {
  nearbyCity?: string;
  workLocation?: string;
  workAddress?: string;
  pickUpLocation?: string;
  pickupAddress?: string;
  workLatitude?: number;
  workLongitude?: number;
  pickupLatitude?: number;
  pickupLongitude?: number;
}

export const updateCustomerProfileApi = async (
  accessToken: string,
  profileData: UpdateProfileData,
) => {
  const response = await fetch(`${API_BASE_URL}/customer/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to update customer profile');
  }

  return response.json();
};

export const updateChildProfileApi = async (
  accessToken: string,
  childId: string | number,
  childData: UpdateChildData,
) => {
  // Extract numeric ID from prefixed string if needed
  const numericChildId = typeof childId === 'string' && childId.startsWith('child-') 
    ? childId.replace('child-', '') 
    : childId;

  const response = await fetch(`${API_BASE_URL}/customer/child/${numericChildId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(childData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to update child profile');
  }

  return response.json();
};

export const updateStaffProfileApi = async (
  accessToken: string,
  staffData: UpdateStaffData,
) => {
  const response = await fetch(`${API_BASE_URL}/customer/staff`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(staffData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to update staff profile');
  }

  return response.json();
};