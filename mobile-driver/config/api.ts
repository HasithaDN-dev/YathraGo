// API Configuration for different environments

export const API_CONFIG = {
  // For development - using your computer's actual IP address
  baseURL: 'http://192.168.1.127:3000',
  
  // Alternative: Use your computer's network IP
  // On Windows: ipconfig | findstr "IPv4"
  // On Mac/Linux: ifconfig | grep "inet "
  
  endpoints: {
    auth: {
      sendOtp: '/auth/get-started/send-otp',
      verifyOtp: '/auth/get-started/verify-otp',
      health: '/auth/health',
    },
  },
};

// Helper function to get full URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

// Test function to check connectivity
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(getApiUrl(API_CONFIG.endpoints.auth.health), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};
