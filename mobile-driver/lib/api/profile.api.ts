import { API_BASE_URL } from '../../config/api';
import { Driver, DriverProfileData, DriverRegistrationData, VehicleData, DocumentUploadData, DriverProfileComplete } from '../../types/driver.types';
import { tokenService } from '../services/token.service';

/**
 * Get driver profile
 */
export const getDriverProfileApi = async (token: string): Promise<Driver> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  const response = await authenticatedFetch(`${API_BASE_URL}/driver/profile`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch driver profile' }));
    throw new Error(error.message || 'Failed to fetch driver profile');
  }
  
  const data = await response.json();
  return data.profile;
};

/**
 * Update driver profile
 */
export const updateDriverProfileApi = async (
  token: string,
  data: DriverProfileData
): Promise<{ success: boolean; message: string; profile: Driver }> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  const response = await authenticatedFetch(`${API_BASE_URL}/driver/update-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMsg = 'Failed to update driver profile';
    try {
      const err = await response.json();
      if (err && err.message) errorMsg = err.message;
      console.error('Profile update error:', err);
    } catch (e) {
      // ignore JSON parse error
    }
    throw new Error(errorMsg);
  }
  return response.json();
};

/**
 * Complete driver registration
 */
export const completeDriverRegistrationApi = async (
  token: string,
  data: DriverRegistrationData
): Promise<{ driverId: string; success: boolean; message: string; registrationStatus?: string }> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  const response = await authenticatedFetch(`${API_BASE_URL}/driver/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMsg = 'Failed to complete driver registration';
    try {
      const err = await response.json();
      if (err && err.message) errorMsg = err.message;
      console.error('Driver registration error:', err);
    } catch (e) {
      // ignore JSON parse error
    }
    throw new Error(errorMsg);
  }
  return response.json();
};

/**
 * Upload ID documents
 */
export const uploadIdDocumentsApi = async (
  token: string,
  documents: DocumentUploadData
): Promise<{ success: boolean; message: string }> => {
  const formData = new FormData();
  formData.append('frontImage', {
    uri: documents.frontImage.uri,
    name: 'front.jpg',
    type: 'image/jpeg',
  } as any);
  formData.append('backImage', {
    uri: documents.backImage.uri,
    name: 'back.jpg',
    type: 'image/jpeg',
  } as any);

  const response = await fetch(`${API_BASE_URL}/driver/upload-id-documents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to upload ID documents' }));
    throw new Error(error.message || 'Failed to upload ID documents');
  }

  return response.json();
};



/**
 * Get driver registration status
 */
export const getDriverRegistrationStatusApi = async (token: string): Promise<string> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  const response = await authenticatedFetch(`${API_BASE_URL}/driver/profile`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch registration status' }));
    throw new Error(error.message || 'Failed to fetch registration status');
  }
  
  const data = await response.json();
  return data.profile?.registrationStatus || 'OTP_PENDING';
};

/**
 * Get driver profile by driver ID (without authentication - for testing)
 */
export const getDriverProfileById = async (driverId: number): Promise<DriverProfileComplete> => {
  const response = await fetch(`${API_BASE_URL}/driver/profile/${driverId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch driver profile' }));
    throw new Error(error.message || 'Failed to fetch driver profile');
  }
  
  const data = await response.json();
  return data.profile;
};
