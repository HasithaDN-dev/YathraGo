/**
 * API Service for Customer Mobile Application
 * Handles authentication, registration, and profile management
 */

import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildRegistration, StaffPassengerRegistration,CustomerRegistration } from '../types/registration.types';
import { Profile } from '../types/profile.types';

// Constants
const TOKEN_KEY = 'customer_auth_token';
const CUSTOMER_KEY = 'customer_data';

export class ApiService {
  private static async request(endpoint: string, options: RequestInit = {}) {
    try {
      console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
      if (options.body) {
        console.log('Request payload:', options.body);
      }
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      const responseText = await response.text();
      console.log(`API Response Status: ${response.status}`);
      console.log(`API Response Body: ${responseText}`);
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message && Array.isArray(errorData.message)) {
            errorMessage = errorData.message.map((err: any) => {
              if (err.field && err.errors) {
                return `${err.field}: ${err.errors.join(', ')}`;
              }
              return JSON.stringify(err);
            }).join('\n');
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.map((err: any) => {
              if (typeof err === 'string') return err;
              if (err.message) return err.message;
              if (err.msg) return err.msg;
              return JSON.stringify(err);
            }).join(', ');
          } else {
            errorMessage = responseText;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        return { success: true, data: responseText };
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Network error: Cannot connect to server. Make sure the backend is running on http://192.168.1.127:3000');
      }
      throw error;
    }
  }

  /**
   * Authentication Methods
   */
  static async sendCustomerOtp(phone: string) {
    return this.request('/auth/customer/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  }

  static async verifyCustomerOtp(phone: string, otp: string, otpId: string) {
    const response = await this.request('/auth/customer/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, otpId })
    });

    // Store token and customer data if successful
    if (response.token) {
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      if (response.customer) {
        await AsyncStorage.setItem(CUSTOMER_KEY, JSON.stringify(response.customer));
      }
    }

    return response;
  }

  static async validateToken(token: string) {
    return this.request('/auth/customer/validate-token', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  static async logout(token: string) {
    try {
      await this.request('/auth/customer/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      console.log('Logout API call failed, proceeding with local cleanup');
    } finally {
      // Always clear local storage
      await AsyncStorage.multiRemove([TOKEN_KEY, CUSTOMER_KEY]);
    }
  }

  static async getStoredCustomer(): Promise<any | null> {
    try {
      const customerData = await AsyncStorage.getItem(CUSTOMER_KEY);
      return customerData ? JSON.parse(customerData) : null;
    } catch (error) {
      console.error('Error getting stored customer:', error);
      return null;
    }
  }

  static async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  }

  /**
   * Registration Methods
   */
  static async registerCustomer(token: string, data: CustomerRegistration) {
    // Normalize, trim, and map all fields to match backend DTO
    const payload: any = {
      customerId: Number(data.customerId),
      name: String(data.name || '').trim(),
      emergencyContact: String(data.emergencyContact || '').trim(),
      email: String(data.email || '').trim().toLowerCase(),
      address: String(data.address || '').trim(),
    };
    if (data.profileImageUrl && String(data.profileImageUrl).trim()) {
      payload.profileImageUrl = String(data.profileImageUrl).trim();
    }

        // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(payload.email)) {
      throw new Error('Invalid email format');
    }

          // Validate required fields are not empty
    const requiredFields = ['emergencyContact', 'email', 'address'];
    for (const field of requiredFields) {
      if (!payload[field] || payload[field] === '') {
        throw new Error(`${field} is required and cannot be empty`);
      }
    }
    
    return this.request('/customer/customer-register', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  static async registerChild(token: string, data: ChildRegistration) {
    // Normalize, trim, and map all fields to match backend DTO
    const payload: any = {
      customerId: Number(data.customerId),
      childName: String(data.childName || '').trim(),
      relationship: String(data.relationship || '').trim(),
      nearbyCity: String(data.nearbyCity || '').trim(),
      schoolLocation: String(data.schoolLocation || '').trim(),
      school: String(data.school || '').trim(),
      pickUpAddress: String(data.pickUpAddress || '').trim(),
    };
    if (data.childImageUrl && String(data.childImageUrl).trim()) {
      payload.childImageUrl = String(data.childImageUrl).trim();
    }

    // Validate required fields are not empty
    const requiredFields = ['childName', 'relationship', 'nearbyCity', 'schoolLocation', 'school', 'pickUpAddress'];
    for (const field of requiredFields) {
      if (!payload[field] || payload[field] === '') {
        throw new Error(`${field} is required and cannot be empty`);
      }
    }

    return this.request('/customer/register-child', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  static async registerStaffPassenger(token: string, data: StaffPassengerRegistration) {
    // Ensure all fields match the DTO exactly
    const payload: any = {
      customerId: Number(data.customerId), // Must be number for DTO validation
      nearbyCity: String(data.nearbyCity || '').trim(),
      workLocation: String(data.workLocation || '').trim(),
      workAddress: String(data.workAddress || '').trim(),
      pickUpLocation: String(data.pickUpLocation || '').trim(),
      pickupAddress: String(data.pickupAddress || '').trim(),
    };

    // Only add optional fields if they have meaningful values
    if (data.profileImageUrl && String(data.profileImageUrl).trim()) {
      payload.profileImageUrl = String(data.profileImageUrl).trim();
    }
      
    // Validate required fields are not empty
    const requiredFields = ['nearbyCity', 'workLocation', 'workAddress', 'pickUpLocation', 'pickupAddress'];
    for (const field of requiredFields) {
      if (!payload[field] || payload[field] === '') {
        throw new Error(`${field} is required and cannot be empty`);
      }
    }
    
    return this.request('/customer/register-staff-passenger', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  /**
   * Profile Methods
   */
  static async getProfile(token: string) {
    return this.request('/customer/profile', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  static async updateProfile(token: string, data: Partial<Profile>) {
    return this.request('/customer/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
  }

  /**
   * Utility Methods
   */
  static async healthCheck() {
    return this.request('/health', {
      method: 'GET'
    });
  }
}

// Default export for backward compatibility
export default ApiService;