import { API_BASE_URL } from '../../config/api';
import { Driver, DriverProfileData, DriverRegistrationData, DocumentUploadData } from '../../types/driver.types';
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
  const formData = new FormData();
  
  // Add text fields
  formData.append('firstName', data.firstName || '');
  formData.append('lastName', data.lastName || '');
  formData.append('NIC', data.NIC || '');
  formData.append('city', data.city || '');
  formData.append('dateOfBirth', data.dateOfBirth || '');
  formData.append('gender', data.gender || '');
  formData.append('email', data.email || '');
  formData.append('secondaryPhone', data.secondaryPhone || '');
  formData.append('profileImage', data.profileImage || '');
  
  // Add vehicle information
  if (data.vehicleType) formData.append('vehicleType', data.vehicleType);
  if (data.vehicleBrand) formData.append('vehicleBrand', data.vehicleBrand);
  if (data.vehicleModel) formData.append('vehicleModel', data.vehicleModel);
  if (data.yearOfManufacture) formData.append('yearOfManufacture', data.yearOfManufacture);
  if (data.vehicleColor) formData.append('vehicleColor', data.vehicleColor);
  if (data.licensePlate) formData.append('licensePlate', data.licensePlate);
  if (data.seats) formData.append('seats', data.seats.toString());
  if (data.femaleAssistant !== undefined) formData.append('femaleAssistant', data.femaleAssistant.toString());
  
  // Add ID document images
  if (data.idFrontImage) {
    formData.append('idFrontImage', {
      uri: data.idFrontImage.uri,
      name: 'idFront.jpg',
      type: 'image/jpeg',
    } as any);
  }
  if (data.idBackImage) {
    formData.append('idBackImage', {
      uri: data.idBackImage.uri,
      name: 'idBack.jpg',
      type: 'image/jpeg',
    } as any);
  }
  
  // Add vehicle images
  if (data.vehicleFrontView) {
    formData.append('vehicleFrontView', {
      uri: data.vehicleFrontView.uri,
      name: 'vehicleFront.jpg',
      type: 'image/jpeg',
    } as any);
  }
  if (data.vehicleSideView) {
    formData.append('vehicleSideView', {
      uri: data.vehicleSideView.uri,
      name: 'vehicleSide.jpg',
      type: 'image/jpeg',
    } as any);
  }
  if (data.vehicleRearView) {
    formData.append('vehicleRearView', {
      uri: data.vehicleRearView.uri,
      name: 'vehicleRear.jpg',
      type: 'image/jpeg',
    } as any);
  }
  if (data.vehicleInteriorView) {
    formData.append('vehicleInteriorView', {
      uri: data.vehicleInteriorView.uri,
      name: 'vehicleInterior.jpg',
      type: 'image/jpeg',
    } as any);
  }
  
  // Add vehicle documents
  if (data.revenueLicense && data.revenueLicense.assets && data.revenueLicense.assets[0]) {
    formData.append('revenueLicense', {
      uri: data.revenueLicense.assets[0].uri,
      name: data.revenueLicense.assets[0].name || 'revenueLicense.pdf',
      type: data.revenueLicense.assets[0].mimeType || 'application/pdf',
    } as any);
  }
  if (data.vehicleInsurance && data.vehicleInsurance.assets && data.vehicleInsurance.assets[0]) {
    formData.append('vehicleInsurance', {
      uri: data.vehicleInsurance.assets[0].uri,
      name: data.vehicleInsurance.assets[0].name || 'vehicleInsurance.pdf',
      type: data.vehicleInsurance.assets[0].mimeType || 'application/pdf',
    } as any);
  }
  if (data.registrationDoc && data.registrationDoc.assets && data.registrationDoc.assets[0]) {
    formData.append('registrationDoc', {
      uri: data.registrationDoc.assets[0].uri,
      name: data.registrationDoc.assets[0].name || 'registrationDoc.pdf',
      type: data.registrationDoc.assets[0].mimeType || 'application/pdf',
    } as any);
  }
  if (data.licenseFront) {
    formData.append('licenseFront', {
      uri: data.licenseFront.uri,
      name: 'licenseFront.jpg',
      type: 'image/jpeg',
    } as any);
  }
  if (data.licenseBack) {
    formData.append('licenseBack', {
      uri: data.licenseBack.uri,
      name: 'licenseBack.jpg',
      type: 'image/jpeg',
    } as any);
  }
  
  const response = await fetch(`${API_BASE_URL}/driver/register`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Note: Do NOT set Content-Type for FormData, let the browser set it with boundary
    },
    body: formData,
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
