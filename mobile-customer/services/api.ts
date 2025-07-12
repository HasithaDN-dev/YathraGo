// mobile-customer/services/api.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiService {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Customer Authentication (Mobile Only)
  static async sendCustomerOtp(phone: string) {
    return this.request('/auth/customer/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  static async verifyCustomerOtp(phone: string, otp: string) {
    return this.request('/auth/customer/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  }

  static async refreshToken(token: string) {
    return this.request('/auth/customer/refresh-token', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async validateToken(token: string) {
    return this.request('/auth/customer/validate-token', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async logout(token: string) {
    return this.request('/auth/customer/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Customer Profile & Registration
  static async getProfile(token: string) {
    return this.request('/customer/profile', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async updateProfile(token: string, profileData: any) {
    return this.request('/customer/update-profile', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(profileData),
    });
  }

  static async registerStaffPassenger(token: string, data: any) {
    return this.request('/customer/register-staff-passenger', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  static async registerChild(token: string, data: any) {
    return this.request('/customer/register-child', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }
}
