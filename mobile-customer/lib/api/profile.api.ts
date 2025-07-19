import { API_BASE_URL } from '../../config/api';
import { Profile, CustomerProfileData, ChildProfileData, StaffProfileData } from '../../types/customer.types';

/**
 * Fetches all profiles associated with the logged-in user (parent + children).
 */
export const getProfilesApi = async (token: string): Promise<Profile[]> => {
  const response = await fetch(`${API_BASE_URL}/customer/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch profiles');
  const data = await response.json();
  // Backend returns { success: true, profile: customer }
  // You may want to extract children and staffPassenger from data.profile
  // For now, return [data.profile] for compatibility, or adjust as needed
  return data.profile ? [data.profile] : [];
};

/**
 * The first step of registration. Completes the main user profile.
 */
export const completeCustomerProfileApi = async (
  token: string,
  data: CustomerProfileData
): Promise<{ customerId: string; success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/customer/customer-register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    let errorMsg = 'Failed to complete customer profile';
    try {
      const err = await response.json();
      if (err && err.message) errorMsg = err.message;
      console.error('Profile registration error:', err);
    } catch (e) {
      // ignore JSON parse error
    }
    throw new Error(errorMsg);
  }
  return response.json();
};

/**
 * The final step: registers a child under the parent's account.
 */
export const registerChildApi = async (
  token: string,
  data: ChildProfileData
): Promise<{ success: boolean; message: string }> => {
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
): Promise<{ success: boolean; message: string }> => {
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
