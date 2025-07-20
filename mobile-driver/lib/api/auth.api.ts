import { AuthResponse } from '../../types/driver.types';
import { API_BASE_URL } from '../../config/api';

/**
 * Sends a request to the backend to dispatch an OTP to the user's phone.
 * @param phone - The phone number in international format (e.g., +94712345678)
 */
export const sendOtpApi = async (phone: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/auth/driver/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
    
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send OTP');
      }
      return response.json();
    };
    
    /**
     * Verifies the OTP with the backend.
     * On success, the backend returns the JWT and user object.
     * @param phone - The phone number in international format.
     * @param otp - The 6-digit code entered by the user.
     */
export const verifyOtpApi = async (phone: string, otp: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/driver/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
    
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid OTP');
      }
    
      return response.json();
    };
    