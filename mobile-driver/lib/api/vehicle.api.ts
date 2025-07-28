import { API_BASE_URL } from '../../config/api';
import { VehicleData, DocumentUploadData } from '../../types/driver.types';
import { tokenService } from '../services/token.service';

/**
 * Register vehicle
 */
export const registerVehicleApi = async (
  token: string,
  vehicleData: FormData
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/vehicle/register`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: vehicleData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to register vehicle' }));
    throw new Error(error.message || 'Failed to register vehicle');
  }

  return response.json();
};

/**
 * Upload vehicle documents
 */
export const uploadVehicleDocumentsApi = async (
  token: string,
  documents: FormData
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/vehicle/upload-documents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: documents,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to upload vehicle documents' }));
    throw new Error(error.message || 'Failed to upload vehicle documents');
  }

  return response.json();
};

/**
 * Get vehicle list for driver
 */
export const getVehicleListApi = async (token: string): Promise<any[]> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  const response = await authenticatedFetch(`${API_BASE_URL}/vehicle/list`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch vehicle list' }));
    throw new Error(error.message || 'Failed to fetch vehicle list');
  }
  
  const data = await response.json();
  return data.vehicles || [];
};

/**
 * Get vehicle details by ID
 */
export const getVehicleDetailsApi = async (token: string, vehicleId: string): Promise<any> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  const response = await authenticatedFetch(`${API_BASE_URL}/vehicle/${vehicleId}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch vehicle details' }));
    throw new Error(error.message || 'Failed to fetch vehicle details');
  }
  
  const data = await response.json();
  return data.vehicle;
};

/**
 * Update vehicle information
 */
export const updateVehicleApi = async (
  token: string,
  vehicleId: string,
  vehicleData: Partial<VehicleData>
): Promise<{ success: boolean; message: string }> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  const response = await authenticatedFetch(`${API_BASE_URL}/vehicle/${vehicleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vehicleData),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update vehicle' }));
    throw new Error(error.message || 'Failed to update vehicle');
  }
  
  return response.json();
};

/**
 * Delete vehicle
 */
export const deleteVehicleApi = async (
  token: string,
  vehicleId: string
): Promise<{ success: boolean; message: string }> => {
  const authenticatedFetch = tokenService.createAuthenticatedFetch();
  const response = await authenticatedFetch(`${API_BASE_URL}/vehicle/${vehicleId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete vehicle' }));
    throw new Error(error.message || 'Failed to delete vehicle');
  }
  
  return response.json();
};
