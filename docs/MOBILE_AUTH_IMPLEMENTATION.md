# YathraGo Mobile Authentication Implementation Guide

## Overview

Both the Customer and Driver mobile apps now implement the unified "Get Started" authentication system that automatically handles new user registration and existing user login.

## Setup Complete ✅

### Customer App (`mobile-customer/`)
- ✅ API service configured with correct endpoints
- ✅ Phone authentication screen updated
- ✅ OTP verification screen updated  
- ✅ useAuth hook implemented
- ✅ Environment configuration added

### Driver App (`mobile-driver/`)
- ✅ API service configured with correct endpoints
- ✅ Phone authentication screen updated
- ✅ OTP verification screen updated
- ✅ useAuth hook implemented  
- ✅ Environment configuration added

## Authentication Flow

### 1. Send OTP
- **Customer**: `/auth/customer/send-otp`
- **Driver**: `/auth/driver/send-otp`

Both endpoints return:
```json
{
  "message": "OTP sent successfully",
  "isNewUser": true/false
}
```

### 2. Verify OTP  
- **Customer**: `/auth/customer/verify-otp`
- **Driver**: `/auth/driver/verify-otp`

Both endpoints return:
```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": 123,
    "phone": "+94712345678", 
    "userType": "CUSTOMER/DRIVER",
    "isVerified": true,
    "isNewUser": true/false
  }
}
```

## How to Use

### In React Native Components

```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { sendOtp, verifyOtp, isAuthenticated, user, logout } = useAuth();

  const handleLogin = async () => {
    try {
      // Step 1: Send OTP
      const result = await sendOtp(phoneNumber);
      console.log('Is new user:', result.isNewUser);
      
      // Step 2: Navigate to OTP screen
      router.push({
        pathname: '/verify-otp',
        params: { phoneNumber, isNewUser: result.isNewUser }
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const result = await verifyOtp(phoneNumber, otpCode);
      
      // Automatically stored in AsyncStorage and state updated
      if (result.user.isNewUser) {
        router.replace('/profile-setup');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
};
```

### Direct API Usage

```typescript
import { ApiService } from '../services/api';

// Customer app
const result = await ApiService.sendCustomerOtp(phoneNumber);
const authResult = await ApiService.verifyCustomerOtp(phoneNumber, otp);

// Driver app  
const result = await ApiService.sendDriverOtp(phoneNumber);
const authResult = await ApiService.verifyDriverOtp(phoneNumber, otp);
```

## Environment Configuration

Make sure your `.env` files are configured:

**Customer App (.env):**
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Driver App (.env):**
```env  
EXPO_PUBLIC_API_URL=http://localhost:3000
```

For production, replace with your actual API URL.

## Navigation Logic

Both apps implement smart navigation based on the `isNewUser` flag:

- **New Users**: Directed to profile setup screens
- **Existing Users**: Directed to main app screens

## Token Management

- JWT tokens are automatically stored in AsyncStorage
- Auth state is managed by useAuth hook
- Token validation happens on app startup
- Automatic token refresh on API calls

## Protected Routes

Use the auth context to protect routes:

```typescript
const { isAuthenticated, loading } = useAuth();

if (loading) return <LoadingScreen />;
if (!isAuthenticated) return <AuthScreen />;
return <MainApp />;
```

## Testing

1. Start the backend server: `npm run start:dev`
2. Start mobile apps: `npm start` 
3. Test the authentication flow with a Sri Lankan phone number
4. Check console for OTP codes when using development/dummy SMS provider

## Next Steps

1. **Profile Setup Screens**: Create dedicated screens for new user onboarding
2. **Navigation Guards**: Implement route protection based on auth state  
3. **Token Refresh**: Add automatic token refresh logic
4. **Error Handling**: Enhance error messages and retry mechanisms
5. **Offline Support**: Add offline authentication state management
