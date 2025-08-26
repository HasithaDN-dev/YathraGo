import { API_BASE_URL } from '../../config/api';
import { AuthResponse } from '../../types/driver.types';

/**
 * Send OTP to driver's phone number
 */
export const sendOtpApi = async (phone: string): Promise<{ message: string; isNewUser: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/auth/driver/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to send OTP' }));
    throw new Error(error.message || 'Failed to send OTP');
  }

  return response.json();
};

/**
 * Verify OTP and get authentication token
 */
export const verifyOtpApi = async (phone: string, otp: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/driver/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone, otp }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to verify OTP' }));
    throw new Error(error.message || 'Failed to verify OTP');
  }

  return response.json();
};

/**
 * Validate authentication token
 */
export const validateTokenApi = async (token: string): Promise<{ valid: boolean; user: any }> => {
  const response = await fetch(`${API_BASE_URL}/auth/driver/validate-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Token validation failed' }));
    throw new Error(error.message || 'Token validation failed');
  }

  return response.json();
};

/**
 * Refresh authentication token
 */
export const refreshTokenApi = async (token: string): Promise<{ accessToken: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/driver/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Token refresh failed' }));
    throw new Error(error.message || 'Token refresh failed');
  }

  return response.json();
};

/**
 * Logout driver
 */
export const logoutApi = async (token: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/driver/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Logout failed' }));
    throw new Error(error.message || 'Logout failed');
  }

  return response.json();
};
