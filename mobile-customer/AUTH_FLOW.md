# Authentication Flow Documentation

## Overview

This document describes the complete authentication flow implemented in the YathraGo customer mobile app using Expo Router, Zustand, and NestJS backend.

## Architecture

### State Management
- **Auth Store** (`lib/stores/auth.store.ts`): Manages authentication state, tokens, and user data
- **Profile Store** (`lib/stores/profile.store.ts`): Manages profile switching and profile data
- **Token Service** (`lib/services/token.service.ts`): Handles token validation and refresh

### Storage Strategy
- **SecureStore**: For sensitive data (JWT tokens, user credentials)
- **AsyncStorage**: For non-sensitive data (default profile ID, preferences)

### Profile Types
- **Child Profile**: For school transport services (multiple allowed)
- **Staff Profile**: For office/staff transport services (one per customer)

## Authentication Flow

### 1. App Startup
```
App Launch → Root Layout → Check Hydration → Route Based on Auth State
```

### 2. Authentication States
- **Unauthenticated**: User needs to login
- **Authenticated, Profile Incomplete**: User needs to complete profile setup
- **Authenticated, Profile Complete**: User can access main app

### 3. Login Flow
```
Phone Input → OTP Verification → Backend Validation → Store Token → Check Profile Status
```

### 4. Profile Management
```
Profile Complete → Load Profiles → Set Default Profile → Show Profile Switcher
```

### 5. Profile Types
- **Child Profile**: Multiple children can be registered for school transport
- **Staff Profile**: One staff profile per customer for office transport

## Key Components

### ProfileLoading
- Shows loading states while profiles are being fetched
- Handles error states for failed profile loading
- Simple component for better UX

### ProfileSwitcher
- Header component for profile switching
- Dropdown modal with all available profiles
- Default profile management
- Logout functionality

### useAuth Hook
- Centralized authentication logic
- Automatic token validation
- Profile loading management
- Computed authentication states

## API Integration

### Backend Endpoints Used
- `POST /auth/customer/send-otp`: Send OTP to phone
- `POST /auth/customer/verify-otp`: Verify OTP and get token
- `POST /auth/customer/validate-token`: Validate current token
- `POST /auth/customer/refresh-token`: Refresh expired token
- `GET /customer/profile`: Get user profiles
- `POST /customer/customer-register`: Complete customer profile
- `POST /customer/register-child`: Register child profile
- `POST /customer/register-staff-passenger`: Register staff profile

### Token Management
- Automatic token validation on app start
- Automatic token refresh on API calls
- Secure token storage using Expo SecureStore
- Automatic logout on token expiration

## File Structure

```
mobile-customer/
├── lib/
│   ├── stores/
│   │   ├── auth.store.ts          # Authentication state
│   │   └── profile.store.ts       # Profile management state
│   ├── services/
│   │   └── token.service.ts       # Token validation & refresh
│   └── api/
│       ├── auth.api.ts            # Authentication API calls
│       └── profile.api.ts         # Profile API calls
├── hooks/
│   └── useAuth.ts                 # Authentication hook
├── components/
│   ├── ProfileSwitcher.tsx        # Profile switching UI
│   └── ProfileLoading.tsx         # Loading states
├── app/
│   ├── _layout.tsx                # Root layout with protected routes
│   ├── (auth)/                    # Authentication screens
│   ├── (registration)/            # Profile setup screens
│   └── (tabs)/                    # Main app screens
└── types/
    └── customer.types.ts          # TypeScript types
```

## Usage Examples

### Using the useAuth Hook
```typescript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { 
    isAuthenticated, 
    activeProfile, 
    logout, 
    refreshProfiles 
  } = useAuth();

  // Component logic
}
```

### Protected Routes
```typescript
// In app/_layout.tsx
<Stack.Protected guard={isLoggedIn && isProfileComplete}>
  <Stack.Screen name="(tabs)" />
</Stack.Protected>
```

### Profile Switching
```typescript
import { useProfileStore } from '../lib/stores/profile.store';

const { setActiveProfile, setDefaultProfile } = useProfileStore();

// Switch to a different profile
setActiveProfile(profileId);

// Set as default profile
await setDefaultProfile(profileId);
```

## Security Features

1. **Secure Token Storage**: JWT tokens stored in Expo SecureStore
2. **Automatic Token Validation**: Tokens validated on app start
3. **Automatic Token Refresh**: Expired tokens automatically refreshed
4. **Automatic Logout**: Users logged out on authentication failures
5. **Protected Routes**: Routes protected based on authentication state

## Error Handling

- Network errors with retry mechanisms
- Token validation failures with automatic logout
- Profile loading errors with retry options
- Graceful degradation for offline scenarios

## Testing the Flow

1. **Fresh Install**: App should show onboarding/phone auth
2. **New User**: Phone → OTP → Profile Setup → Main App
3. **Existing User**: Phone → OTP → Main App (with profiles loaded)
4. **Profile Switching**: Use ProfileSwitcher to switch between profiles
5. **Logout**: Should clear all data and return to auth screen
6. **Token Expiry**: Should automatically refresh or logout user

## Troubleshooting

### Common Issues
1. **Hydration Issues**: Check if `hasHydrated` is properly set
2. **Profile Loading**: Verify API endpoints and token validity
3. **Token Refresh**: Check backend refresh token implementation
4. **Route Protection**: Ensure guard conditions are correct

### Debug Information
The home screen includes debug information showing:
- User ID
- Profile completion status
- Active profile ID
- Total number of profiles

## Future Enhancements

1. **Offline Support**: Cache profiles for offline access
2. **Biometric Authentication**: Add fingerprint/face ID support
3. **Multi-device Sync**: Sync authentication across devices
4. **Advanced Profile Management**: Add/edit/delete profiles
5. **Push Notifications**: Notify on authentication events 