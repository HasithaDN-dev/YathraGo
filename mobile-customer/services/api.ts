/**
 * API Service for Customer Mobile Application
 * Handles authentication, registration, and profile management
 */

import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildRegistration, StaffPassengerRegistration } from '../types/registration.types';
import { Profile } from '../types/profile.types';

// Generic API response type
type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

// Constants
const TOKEN_KEY = 'customer_auth_token';
const CUSTOMER_KEY = 'customer_data';

/**
 * Generic API request handler
 */
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get auth token if available
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    if (config.body) {
      console.log('Request Body:', config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    console.log(`API Response [${response.status}]:`, data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`,
        data: data
      };
    }

    return {
      success: true,
      data: data,
      message: data.message
    };
  } catch (error) {
    console.error('API Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
}

/**
 * Authentication Services
 */
export const authService = {
  /**
   * Send OTP to customer phone number
   */
  async sendCustomerOtp(phone: string): Promise<ApiResponse<{ message: string; otpId: string }>> {
    return apiRequest<{ message: string; otpId: string }>('/auth/customer/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  },

  /**
   * Verify OTP and get authentication token
   */
  async verifyCustomerOtp(phone: string, otp: string, otpId: string): Promise<ApiResponse<{ token: string; customer: any }>> {
    const response = await apiRequest<{ token: string; customer: any }>('/auth/customer/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, otpId })
    });

    // Store token and customer data if successful
    if (response.success && response.data) {
      await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
      await AsyncStorage.setItem(CUSTOMER_KEY, JSON.stringify(response.data.customer));
    }

    return response;
  },

  /**
   * Validate current authentication token
   */
  async validateToken(): Promise<ApiResponse<{ valid: boolean; customer?: any }>> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found'
      };
    }

    return apiRequest<{ valid: boolean; customer?: any }>('/auth/customer/validate-token', {
      method: 'POST'
    });
  },

  /**
   * Logout customer and clear stored data
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate token on server
      await apiRequest('/auth/customer/logout', {
        method: 'POST'
      });
    } catch {
      console.log('Logout API call failed, proceeding with local cleanup');
    } finally {
      // Always clear local storage
      await AsyncStorage.multiRemove([TOKEN_KEY, CUSTOMER_KEY]);
    }
  },

  /**
   * Get stored customer data
   */
  async getStoredCustomer(): Promise<any | null> {
    try {
      const customerData = await AsyncStorage.getItem(CUSTOMER_KEY);
      return customerData ? JSON.parse(customerData) : null;
    } catch (error) {
      console.error('Error getting stored customer:', error);
      return null;
    }
  },

  /**
   * Check if customer is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  }
};

/**
 * Registration Services
 */
export const registrationService = {
  /**
   * Register a staff passenger with detailed validation
   */
  async registerStaffPassenger(data: StaffPassengerRegistration): Promise<ApiResponse<{ id: string; message: string; registrationNumber?: string }>> {
    // Ensure all fields match the DTO exactly
    const payload: any = {
      customerId: Number(data.customerId), // Must be number for DTO validation
      nearbyCity: String(data.nearbyCity || '').trim(),
      workLocation: String(data.workLocation || '').trim(),
      workAddress: String(data.workAddress || '').trim(),
      pickUpLocation: String(data.pickUpLocation || '').trim(),
      pickupAddress: String(data.pickupAddress || '').trim(),
      name: String(data.name || '').trim(),
      email: String(data.email || '').trim().toLowerCase(),
      address: String(data.address || '').trim(),
    };
    
    if (data.emergencyContact && String(data.emergencyContact).trim()) {
      payload.emergencyContact = String(data.emergencyContact).trim();
    }
    
    // Validate required fields are not empty
    const requiredFields = ['nearbyCity', 'workLocation', 'workAddress', 'pickUpLocation', 'pickupAddress', 'name', 'email', 'address'];
    for (const field of requiredFields) {
      if (!payload[field] || payload[field] === '') {
        return {
          success: false,
          error: `${field} is required and cannot be empty`
        };
      }
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(payload.email)) {
      return {
        success: false,
        error: 'Invalid email format'
      };
    }
    
    console.log('Final payload for staff registration:', JSON.stringify(payload, null, 2));
    console.log('Payload validation check:', {
      customerId: typeof payload.customerId,
      nearbyCity: typeof payload.nearbyCity,
      email: typeof payload.email,
      emailValid: emailRegex.test(payload.email),
      hasProfileImageUrl: 'profileImageUrl' in payload,
      hasEmergencyContact: 'emergencyContact' in payload,
    });
    
    return apiRequest<{ id: string; message: string; registrationNumber?: string }>('/customer/register-staff-passenger', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Register a child with detailed validation
   */
  async registerChild(data: ChildRegistration): Promise<ApiResponse<{ id: string; message: string; registrationNumber?: string }>> {
    // Normalize, trim, and map all fields to match backend DTO
    const payload: any = {
      customerId: Number(data.customerId),
      childName: String(data.childName || '').trim(),
      relationship: String(data.relationship || '').trim(),
      nearbyCity: String(data.nearbyCity || '').trim(),
      schoolLocation: String(data.schoolLocation || '').trim(),
      school: String(data.school || '').trim(),
      pickUpAddress: String(data.pickUpAddress || '').trim(),
      emergencyContact: String(data.emergencyContact || '').trim(),
      parentName: String(data.parentName || '').trim(),
      parentEmail: String(data.parentEmail || '').trim().toLowerCase(),
      parentAddress: String(data.parentAddress || '').trim(),
    };
    
    if (data.childImageUrl && String(data.childImageUrl).trim()) {
      payload.childImageUrl = String(data.childImageUrl).trim();
    }
    if (data.parentImageUrl && String(data.parentImageUrl).trim()) {
      payload.parentImageUrl = String(data.parentImageUrl).trim();
    }
    
    return apiRequest<{ id: string; message: string; registrationNumber?: string }>('/customer/register-child', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

/**
 * Profile Services
 */
export const profileService = {
  /**
   * Get customer profile
   */
  async getProfile(): Promise<ApiResponse<Profile>> {
    return apiRequest<Profile>('/customer/profile', {
      method: 'GET'
    });
  },

  /**
   * Update customer profile
   */
  async updateProfile(data: Partial<Profile>): Promise<ApiResponse<Profile>> {
    return apiRequest<Profile>('/customer/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};

/**
 * Utility Services
 */
export const utilityService = {
  /**
   * Check API health
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return apiRequest<{ status: string; timestamp: string }>('/health', {
      method: 'GET'
    });
  }
};

// Default export for backward compatibility
export default {
  auth: authService,
  registration: registrationService,
  profile: profileService,
  utility: utilityService
};
