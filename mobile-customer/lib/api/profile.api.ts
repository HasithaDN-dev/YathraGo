import { API_BASE_URL } from '../../config/api';
import { CustomerProfileData, ChildProfileData, StaffProfileData } from '../../types/registration.types';
import { Profile } from '../../types/profile.types';

/**
 * Fetches all profiles associated with the logged-in user (parent + children).
 */
export const getProfilesApi = async (token: string): Promise<Profile[]> => {
  const response = await fetch(`${API_BASE_URL}/customer/profile`, { // Assuming this is the correct endpoint
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch profiles');
  return response.json();
};

/**
 * The first step of registration. Completes the main user profile.
 */
export const completeCustomerProfileApi = async (
  token: string,
  data: CustomerProfileData
): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/customer/customer-register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to complete customer profile');
  return response.json();
};

/**
 * The final step: registers a child under the parent's account.
 */
export const registerChildApi = async (
  token: string,
  data: ChildProfileData
): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/customer/register-child`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to register child');
  return response.json();
};

/**
 * The final step: registers the parent for staff transport services.
 */
export const registerStaffApi = async (
  token: string,
  data: StaffProfileData
): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/customer/register-staff-passenger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to register for staff transport');
  return response.json();
};
