# Driver Authentication Implementation - Session-Based Dynamic ID

## Overview

This document outlines the complete implementation of dynamic driver authentication using JWT tokens throughout the YathraGo driver mobile app and backend. All hardcoded driver IDs have been replaced with session-based authentication.

## Changes Summary

### 🔐 Enhanced Token Service

**File:** `mobile-driver/lib/services/token.service.ts`

**New Methods Added:**

- `getDriverIdFromToken()` - Extract driver ID from JWT token
- `getTokenPayload()` - Get full JWT payload for debugging/logging

**Purpose:** Centralized token management with ability to extract driver information from JWT tokens.

---

### 📱 Mobile Driver App Changes

#### 1. Home Screen (`mobile-driver/app/(tabs)/index.tsx`)

**Changes:**

- ✅ Removed all hardcoded API calls
- ✅ Integrated `useAuthStore` to access user session
- ✅ Uses authenticated fetch for all API calls
- ✅ Displays driver name from session/API
- ✅ Shows online/offline status based on driver status from database
- ✅ Added loading states and error handling with fallbacks

**Key Features:**

- Greets driver by name from session
- Displays current online/offline status dynamically
- Fetches student count using authenticated API

#### 2. Trip History (`mobile-driver/app/(tabs)/history.tsx`)

**Changes:**

- ❌ Removed: `const driverId = 1;` (hardcoded)
- ✅ Updated: `getDriverTripHistory()` now uses JWT token automatically
- ✅ No longer needs to pass driver ID

#### 3. Profile Image Component (`mobile-driver/components/ProfileImage.tsx`)

**Changes:**

- ❌ Removed: `const DRIVER_ID = 1;`
- ✅ Uses `getDriverProfileApi()` with authentication token
- ✅ Falls back to user data from auth store if API fails

#### 4. Personal Details Screen (`mobile-driver/app/profile/(personal)/personal.tsx`)

**Changes:**

- ❌ Removed: `const DRIVER_ID = 1;`
- ✅ Uses `getDriverProfileApi()` with authentication token
- ✅ Updated to use `Driver` type from auth store

---

### 🛠️ API Layer Updates

#### 1. Trip API (`mobile-driver/lib/api/trip.api.ts`)

**Changes:**

```typescript
// Before
export const getDriverTripHistory = async (driverId: number)

// After
export const getDriverTripHistory = async ()
```

- Uses authenticated fetch
- Driver ID extracted from JWT token on backend

#### 2. Maps API (`mobile-driver/lib/api/maps.api.ts`)

**Changes:**
All functions updated to use JWT authentication:

- `fetchOptimizedRoute()` - No longer requires driverId parameter
- `fetchOptimizedRouteWithGPS()` - No longer requires driverId parameter
- `getLatestRoute()` - Adds authentication header

**Key Updates:**

```typescript
// Before
fetchOptimizedRouteWithGPS(driverId: number, lat?: number, lng?: number)

// After
fetchOptimizedRouteWithGPS(lat?: number, lng?: number)
```

---

### 🔧 Backend Changes

#### 1. Driver Controller (`backend/src/driver/driver.controller.ts`)

**Interface Updated:**

```typescript
interface AuthenticatedRequest extends Request {
  user: {
    sub: string; // Changed from userId to sub
    phone: string;
    userType: UserType;
    isVerified: boolean;
  };
}
```

**Endpoints Updated:**

##### a) Get Driver Profile

```typescript
// Before: Used req.user.userId
// After: Uses req.user.sub

@UseGuards(JwtAuthGuard)
@Get('profile')
async getDriverProfile(@Req() req: AuthenticatedRequest) {
  const driverId = req.user.sub;
  return this.driverService.getDriverProfile(driverId);
}
```

##### b) Get Trip History

```typescript
// Before: @Get('trip-history/:driverId') - NO JWT
// After: @Get('trip-history') - WITH JWT

@UseGuards(JwtAuthGuard)
@Get('trip-history')
async getDriverTripHistory(@Req() req: AuthenticatedRequest) {
  const driverId = req.user.sub;
  return this.driverService.getDriverTripHistory(driverId);
}
```

##### c) Get Driver Details (NEW)

```typescript
// Before: Commented out with hardcoded driverId = 2
// After: Active endpoint with JWT authentication

@UseGuards(JwtAuthGuard)
@Get('details')
async getDriverDetails(@Req() req: AuthenticatedRequest) {
  const driverId = req.user.sub;
  return this.driverService.getDriverDetailsById(parseInt(driverId, 10));
}
```

##### d) Optimize Route

```typescript
// Before: @Post(':driverId/optimize-route') - Driver ID in URL
// After: @Post('optimize-route') - Driver ID from JWT

@UseGuards(JwtAuthGuard)
@Post('optimize-route')
async optimizeRoute(
  @Req() req: AuthenticatedRequest,
  @Body() body: { latitude?: number; longitude?: number }
) {
  const driverId = parseInt(req.user.sub, 10);
  // ... rest of implementation
}
```

#### 2. Child Ride Request Controller (`backend/src/child-ride-request/child-ride-request.controller.ts`)

**Complete Rewrite:**

```typescript
// Before
@Controller("driver/child-ride-requests")
export class ChildRideRequestController {
  @Get()
  async getChildRideRequestsForDriver() {
    const driverId = 2; // HARDCODED!
    return this.service.getRequestsForDriver(driverId);
  }
}

// After
@Controller("driver/child-ride-requests")
export class ChildRideRequestController {
  @UseGuards(JwtAuthGuard)
  @Get()
  async getChildRideRequestsForDriver(@Req() req: AuthenticatedRequest) {
    const driverId = parseInt(req.user.sub, 10);
    return this.service.getRequestsForDriver(driverId);
  }
}
```

---

## 🎯 Key Benefits

### 1. **Security**

- ✅ All endpoints now require JWT authentication
- ✅ Driver ID cannot be spoofed or manipulated
- ✅ Each driver can only access their own data

### 2. **Scalability**

- ✅ No hardcoded IDs anywhere in the codebase
- ✅ Works for any number of drivers
- ✅ Automatic multi-tenant isolation

### 3. **User Experience**

- ✅ Personalized greeting with driver's name
- ✅ Real-time status (online/offline) from database
- ✅ Seamless experience after login/registration

### 4. **Maintainability**

- ✅ Consistent authentication pattern across all endpoints
- ✅ Single source of truth (JWT token)
- ✅ Easy to debug with centralized token service

---

## 🔄 Authentication Flow

### 1. Login/Registration

```
Driver enters phone → OTP sent → OTP verified → JWT token generated
→ Token stored in SecureStore → User object stored in Zustand
```

### 2. API Requests

```
App needs data → tokenService.getToken() → Create authenticated fetch
→ Add Authorization header → Backend validates JWT → Extract driver ID
→ Return driver-specific data
```

### 3. Token Payload Structure

```json
{
  "sub": "1", // Driver ID
  "phone": "+94771234567",
  "userType": "DRIVER",
  "isVerified": true,
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 📋 Files Modified

### Mobile App (Driver)

1. ✅ `mobile-driver/lib/services/token.service.ts`
2. ✅ `mobile-driver/app/(tabs)/index.tsx`
3. ✅ `mobile-driver/app/(tabs)/history.tsx`
4. ✅ `mobile-driver/components/ProfileImage.tsx`
5. ✅ `mobile-driver/app/profile/(personal)/personal.tsx`
6. ✅ `mobile-driver/lib/api/trip.api.ts`
7. ✅ `mobile-driver/lib/api/maps.api.ts`

### Backend

1. ✅ `backend/src/driver/driver.controller.ts`
2. ✅ `backend/src/child-ride-request/child-ride-request.controller.ts`

---

## 🧪 Testing Checklist

### Mobile App

- [ ] Login as different drivers and verify correct name displays on home screen
- [ ] Verify online/offline status reflects database status
- [ ] Check trip history shows only current driver's trips
- [ ] Verify profile loads correct driver information
- [ ] Test route optimization uses correct driver's assigned children

### Backend

- [ ] Test all endpoints reject requests without JWT token
- [ ] Verify driver ID cannot be manipulated in requests
- [ ] Check each driver only sees their own data
- [ ] Test token expiration and refresh flow

---

## 🚀 Deployment Notes

### Environment Variables Required

```env
# Backend
JWT_SECRET=your-secret-key
GOOGLE_MAPS_API_KEY=your-maps-key

# Mobile App
EXPO_PUBLIC_API_URL=https://your-api-url
```

### Database Considerations

- Ensure `driver.status` field is properly set for online/offline functionality
- Verify `driver.name` is populated for all drivers

---

## 📝 API Endpoint Changes Summary

| Endpoint                        | Before                      | After             | Auth   |
| ------------------------------- | --------------------------- | ----------------- | ------ |
| GET /driver/profile             | `req.user.userId`           | `req.user.sub`    | ✅ JWT |
| GET /driver/trip-history        | `/trip-history/:driverId`   | `/trip-history`   | ✅ JWT |
| GET /driver/details             | Commented/Hardcoded         | Active with JWT   | ✅ JWT |
| POST /driver/optimize-route     | `/:driverId/optimize-route` | `/optimize-route` | ✅ JWT |
| GET /driver/child-ride-requests | Hardcoded ID = 2            | Uses JWT          | ✅ JWT |

---

## 🔍 Debugging Tips

### Check Current Driver ID

```typescript
// In mobile app
const payload = await tokenService.getTokenPayload();
console.log("Current driver ID:", payload.sub);
```

### Verify Token on Backend

```typescript
// In controller
console.log("Authenticated as driver:", req.user.sub);
console.log("User type:", req.user.userType);
```

### Common Issues

1. **"No authentication token available"** - User not logged in
2. **"User not found"** - JWT token references non-existent driver
3. **Wrong data showing** - Check if correct driver ID is in token

---

## 📚 Related Documentation

- [DRIVER_AUTH_FLOW.md](mobile-driver/DRIVER_AUTH_FLOW.md) - Original auth flow documentation
- [Backend Auth Service](backend/src/auth/auth.service.ts) - JWT generation logic
- [JWT Strategy](backend/src/auth/strategies/jwt.strategy.ts) - Token validation

---

## ✅ Implementation Complete

All driver-related endpoints now use JWT-based authentication with driver ID extracted from the session token. No hardcoded driver IDs remain in the codebase.

**Status:** ✅ Ready for Testing
**Priority:** 🔴 High - Required for production deployment
**Security Level:** 🔒 Enhanced - All endpoints protected

---

_Last Updated: October 17, 2025_
_Implementation By: AI Assistant_
