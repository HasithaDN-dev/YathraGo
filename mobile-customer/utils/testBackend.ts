// utils/testBackend.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.127:3000';

export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection to:', API_BASE_URL);
    
    // Test basic connectivity
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Backend health check successful:', data);
      return { success: true, data };
    } else {
      console.log('Backend health check failed:', response.statusText);
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const testStaffRegistration = async () => {
  const testData = {
    "customerId": 13,
    "nearbyCity": "Colombo",
    "workLocation": "Company HQ",
    "workAddress": "123 Main St",
    "pickUpLocation": "Bus Stop",
    "pickupAddress": "456 Side St",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "address": "789 Home Ave",
    "profileImageUrl": "https://example.com/profile.jpg",
    "emergencyContact": "+94712345678"
  };

  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMyIsInBob25lIjoiKzk0NzgxMjM0NTY5IiwidXNlclR5cGUiOiJDVVNUT01FUiIsImlzVmVyaWZpZWQiOnRydWUsImlhdCI6MTc1MjQxMDg5MSwiZXhwIjoxNzUzMDE1NjkxfQ.W_jj1dPAafZerF1nc-qYe84IkpaKFWEJd84CnH1bvv4";

  try {
    console.log('Testing staff registration with data:', testData);
    
    const response = await fetch(`${API_BASE_URL}/customer/register-staff-passenger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(testData),
    });

    const responseText = await response.text();
    console.log('Staff registration response status:', response.status);
    console.log('Staff registration response:', responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('Staff registration successful:', data);
        return { success: true, data };
      } catch {
        return { success: true, data: responseText };
      }
    } else {
      console.log('Staff registration failed:', responseText);
      return { success: false, error: responseText };
    }
  } catch (error) {
    console.error('Staff registration test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
