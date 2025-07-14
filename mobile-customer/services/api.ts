import type { ChildRegistration } from '../types/registration.types';
import { API_BASE_URL } from '../config/api';

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
    return this.request('/customer/register-child', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
  // ...existing code...
  // ...existing methods for staff registration, authentication, etc...

  static async registerStaffPassenger(token: string, data: any) {
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

    // Only add optional fields if they have meaningful values
    if (data.profileImageUrl && String(data.profileImageUrl).trim()) {
      payload.profileImageUrl = String(data.profileImageUrl).trim();
    }
    
    if (data.emergencyContact && String(data.emergencyContact).trim()) {
      payload.emergencyContact = String(data.emergencyContact).trim();
    }
    
    // Validate required fields are not empty
    const requiredFields = ['nearbyCity', 'workLocation', 'workAddress', 'pickUpLocation', 'pickupAddress', 'name', 'email', 'address'];
    for (const field of requiredFields) {
      if (!payload[field] || payload[field] === '') {
        throw new Error(`${field} is required and cannot be empty`);
      }
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(payload.email)) {
      throw new Error('Invalid email format');
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
    
    return this.request('/customer/register-staff-passenger', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

}
