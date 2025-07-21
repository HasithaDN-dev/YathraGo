// mobile-driver/services/api.ts
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

  // Driver Authentication (Mobile Only)
  static async sendDriverOtp(phone: string) {
    return this.request('/auth/driver/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  static async verifyDriverOtp(phone: string, otp: string) {
    return this.request('/auth/driver/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  }

  static async refreshToken(token: string) {
    return this.request('/auth/driver/refresh-token', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async validateToken(token: string) {
    return this.request('/auth/driver/validate-token', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async logout(token: string) {
    return this.request('/auth/driver/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async registerDriver(token: string, formData: FormData) {
    const response = await fetch(`${API_BASE_URL}/driver/register`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // 'Content-Type' is automatically set to 'multipart/form-data' by the browser
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }
  // Driver Profile & Registration
  static async getProfile(token: string) {
    return this.request('/driver/profile', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async updateProfile(token: string, profileData: any) {
    return this.request('/driver/update-profile', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(profileData),
    });
  }

  static async uploadDocuments(token: string, documentsData: any) {
    return this.request('/driver/upload-documents', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(documentsData),
    });
  }

  static async uploadIdDocuments(token: string, frontImage: any, backImage: any) {
    const formData = new FormData();
    formData.append('frontImage', {
      uri: frontImage.uri,
      name: 'front.jpg',
      type: 'image/jpeg',
    } as any);
    formData.append('backImage', {
      uri: backImage.uri,
      name: 'back.jpg',
      type: 'image/jpeg',
    } as any);

    const response = await fetch(`${API_BASE_URL}/driver/upload-id-documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // 'Content-Type' is set to 'multipart/form-data' by FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  static async registerVehicle(token: string, vehicleData: FormData) {
    const response = await fetch(`${API_BASE_URL}/vehicle/register`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: vehicleData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  static async completeDriverRegistration(token: string, registrationData: FormData) {
    const response = await fetch(`${API_BASE_URL}/driver/register`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: registrationData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  static async uploadVehicleDocuments(token: string, documents: FormData) {
    const response = await fetch(`${API_BASE_URL}/vehicle/upload-documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: documents,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }
}
