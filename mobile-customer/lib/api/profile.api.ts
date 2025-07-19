import { API_BASE_URL } from '../../config/api';
import { Profile, CustomerProfileData, ChildProfileData, StaffProfileData } from '../../types/customer.types';
import { tokenService } from '../services/token.service';
import { useAuthStore } from '../stores/auth.store';

/**
 * Fetches all profiles associated with the logged-in user (children + staff).
 */
export const getProfilesApi = async (token: string): Promise<Profile[]> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  const response = await authenticatedFetch(`${API_BASE_URL}/customer/profile`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch profiles' }));
    throw new Error(error.message || 'Failed to fetch profiles');
  }
  
  const data = await response.json();
  console.log('Profile API response:', data);
  
  // Backend returns { success: true, profile: { customer, children: [], staffPassenger: null } }
  // We need to extract children and staffPassenger from the profile
  const profiles: Profile[] = [];
  
  if (data.profile) {
    // Add children profiles
    if (data.profile.children && Array.isArray(data.profile.children)) {
      profiles.push(...data.profile.children.map((child: any) => ({
        ...child,
        name: child.childName,
        type: 'child' as const,
      })));
    }
    
    // Add staff profile if exists
    if (data.profile.staffPassenger) {
      profiles.push({
        ...data.profile.staffPassenger,
        name: 'Staff Passenger',
        type: 'staff' as const,
      });
    }
  }
  
  console.log('Extracted profiles:', profiles);
  return profiles;
};

/**
 * The first step of registration. Completes the main user profile.
 */
export const completeCustomerProfileApi = async (
  token: string,
  data: CustomerProfileData
): Promise<{ customerId: string; success: boolean; message: string }> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  const response = await authenticatedFetch(`${API_BASE_URL}/customer/customer-register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  
  // Get the user from auth store to include customerId
  const { user } = useAuthStore.getState();
  const payload = {
    ...data,
    customerId: user?.id
  };
  
  console.log('Child registration payload:', payload);
  
  const response = await authenticatedFetch(`${API_BASE_URL}/customer/register-child`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to register child' }));
    console.error('Child registration API error:', error);
    
    // Handle different error response formats
    let errorMessage = 'Failed to register child';
    if (error.message) {
      if (Array.isArray(error.message)) {
        // Handle validation errors array
        errorMessage = error.message.map((err: any) => 
          `${err.field}: ${err.errors?.join(', ') || 'Invalid value'}`
        ).join(', ');
      } else if (typeof error.message === 'string') {
        errorMessage = error.message;
      } else {
        errorMessage = JSON.stringify(error.message);
      }
    }
    
    throw new Error(errorMessage);
  }
  
  const result = await response.json();
  console.log('Child registration API success:', result);
  return result;
};

/**
 * The final step: registers the parent for staff transport services.
 */
export const registerStaffApi = async (
  token: string,
  data: StaffProfileData
): Promise<{ success: boolean; message: string }> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  
  // Get the user from auth store to include customerId
  const { user } = useAuthStore.getState();
  const payload = {
    ...data,
    customerId: user?.id
  };
  
  console.log('Staff registration payload:', payload);
  
  const response = await authenticatedFetch(`${API_BASE_URL}/customer/register-staff-passenger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to register for staff transport' }));
    console.error('Staff registration API error:', error);
    
    // Handle different error response formats
    let errorMessage = 'Failed to register for staff transport';
    if (error.message) {
      if (Array.isArray(error.message)) {
        // Handle validation errors array
        errorMessage = error.message.map((err: any) => 
          `${err.field}: ${err.errors?.join(', ') || 'Invalid value'}`
        ).join(', ');
      } else if (typeof error.message === 'string') {
        errorMessage = error.message;
      } else {
        errorMessage = JSON.stringify(error.message);
      }
    }
    
    throw new Error(errorMessage);
  }
  
  const result = await response.json();
  console.log('Staff registration API success:', result);
  return result;
};
