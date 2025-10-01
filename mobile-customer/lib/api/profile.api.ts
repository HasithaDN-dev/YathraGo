import { API_BASE_URL } from '../../config/api';
import { Profile, CustomerProfileData, ChildProfileData, StaffProfileData } from '../../types/customer.types';
import { tokenService } from '../services/token.service';
import { useAuthStore } from '../stores/auth.store';

// Simple in-memory cache for profiles
let profileCache: { data: Profile[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches all profiles associated with the logged-in user (children + staff).
 * Uses simple caching to reduce API calls.
 */
export const getProfilesApi = async (token: string): Promise<Profile[]> => {
  // Check cache first
  if (profileCache && (Date.now() - profileCache.timestamp) < CACHE_DURATION) {
    console.log('Using cached profiles');
    return profileCache.data;
  }

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
  
  // Cache the result
  profileCache = {
    data: profiles,
    timestamp: Date.now()
  };
  
  console.log('Extracted profiles:', profiles);
  return profiles;
};

/**
 * Clear profile cache when profiles are updated
 */
export const clearProfileCache = () => {
  profileCache = null;
  console.log('Profile cache cleared');
};

/**
 * The first step of registration. Completes the main user profile.
 */
export const completeCustomerProfileApi = async (
  token: string,
  data: CustomerProfileData
): Promise<{ customerId: string; success: boolean; message: string; registrationStatus?: string }> => {
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
 * Get customer registration status
 */
export const getRegistrationStatusApi = async (token: string): Promise<string> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  const response = await authenticatedFetch(`${API_BASE_URL}/customer/profile`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch registration status' }));
    throw new Error(error.message || 'Failed to fetch registration status');
  }
  
  const data = await response.json();
  return data.profile?.registrationStatus || 'OTP_PENDING';
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
  
  // Extract only the fields needed by the backend DTO
  const payload = {
    customerId: user?.id,
    nearbyCity: data.nearbyCity,
    workLocation: data.workLocation,
    workAddress: data.workAddress,
    pickUpLocation: data.pickUpLocation,
    pickupAddress: data.pickupAddress,
    // Extract coordinates from location details
    workLatitude: data.workLocationDetails?.coordinates.latitude,
    workLongitude: data.workLocationDetails?.coordinates.longitude,
    pickupLatitude: data.pickupLocationDetails?.coordinates.latitude,
    pickupLongitude: data.pickupLocationDetails?.coordinates.longitude,
  };
  
  console.log('Staff registration payload with coordinates:', payload);
  
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

/**
 * Uploads a child profile image to the backend. Returns the unique filename.
 * Reuses the same upload endpoint as customer, but stores in uploads/children if backend supports.
 * If backend uses the same endpoint, this is still reusable.
 */
export const uploadChildProfileImageApi = async (
  token: string,
  imageUri: string
): Promise<{ filename: string }> => {
  const formData = new FormData();
  const uriParts = imageUri.split('/');
  const name = uriParts[uriParts.length - 1];
  const type = name.endsWith('.png') ? 'image/png' : 'image/jpeg';
  formData.append('file', {
    uri: imageUri,
    name,
    type,
  } as any);

  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  // If you have a separate endpoint for child, change the URL here
  const response = await authenticatedFetch(`${API_BASE_URL}/customer/upload-child-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });
  if (!response.ok) {
    let errorMsg = 'Failed to upload child profile image';
    try {
      const err = await response.json();
      if (err && err.message) errorMsg = err.message;
      console.error('Child profile image upload error:', err);
    } catch (e) {}
    throw new Error(errorMsg);
  }
  return response.json();
};
/**
 * Uploads a customer profile image to the backend. Returns the unique filename.
 */
export const uploadCustomerProfileImageApi = async (
  token: string,
  imageUri: string
): Promise<{ filename: string }> => {
  const formData = new FormData();
  // Extract filename and type from uri
  const uriParts = imageUri.split('/');
  const name = uriParts[uriParts.length - 1];
  const type = name.endsWith('.png') ? 'image/png' : 'image/jpeg';
  formData.append('file', {
    uri: imageUri,
    name,
    type,
  } as any);

  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  const response = await authenticatedFetch(`${API_BASE_URL}/customer/upload-profile-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });
  if (!response.ok) {
    let errorMsg = 'Failed to upload profile image';
    try {
      const err = await response.json();
      if (err && err.message) errorMsg = err.message;
      console.error('Profile image upload error:', err);
    } catch (e) {}
    throw new Error(errorMsg);
  }
  return response.json();
};