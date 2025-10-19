# Driver Authentication - Quick Reference Guide

## 🚀 Quick Start

### Mobile App - Getting Driver Info

```typescript
// Get current driver from session
import { useAuthStore } from "@/lib/stores/auth.store";
const { user } = useAuthStore();
console.log(user.name); // Driver's name
console.log(user.status); // ACTIVE/INACTIVE
console.log(user.id); // Driver ID
```

### Mobile App - Making Authenticated API Calls

```typescript
import { tokenService } from "@/lib/services/token.service";

// Method 1: Using authenticated fetch
const authenticatedFetch = tokenService.createAuthenticatedFetch();
const response = await authenticatedFetch(`${API_BASE_URL}/driver/profile`);

// Method 2: Getting token manually
const token = await tokenService.getToken();
const response = await fetch(`${API_BASE_URL}/driver/details`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### Backend - Accessing Driver ID in Controllers

```typescript
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;        // Driver ID
    phone: string;
    userType: UserType;
    isVerified: boolean;
  };
}

@UseGuards(JwtAuthGuard)
@Get('endpoint')
async yourEndpoint(@Req() req: AuthenticatedRequest) {
  const driverId = parseInt(req.user.sub, 10);
  // Use driverId to fetch driver-specific data
}
```

## 📦 Updated API Functions

### Mobile App APIs

```typescript
// OLD WAY ❌
await getDriverTripHistory(driverId);
await fetchOptimizedRouteWithGPS(driverId, lat, lng);
const profile = await getDriverProfileById(driverId);

// NEW WAY ✅
await getDriverTripHistory(); // Driver ID from token
await fetchOptimizedRouteWithGPS(lat, lng); // Driver ID from token
const token = await tokenService.getToken();
const profile = await getDriverProfileApi(token); // Driver ID from token
```

## 🔐 Updated Backend Endpoints

| Endpoint       | Old URL                                       | New URL                           | Requires JWT |
| -------------- | --------------------------------------------- | --------------------------------- | ------------ |
| Trip History   | `GET /driver/trip-history/:driverId`          | `GET /driver/trip-history`        | ✅           |
| Driver Details | `GET /driver/details` (hardcoded)             | `GET /driver/details`             | ✅           |
| Optimize Route | `POST /driver/:driverId/optimize-route`       | `POST /driver/optimize-route`     | ✅           |
| Profile        | `GET /driver/profile`                         | `GET /driver/profile`             | ✅           |
| Child Requests | `GET /driver/child-ride-requests` (hardcoded) | `GET /driver/child-ride-requests` | ✅           |

## 🛠️ Common Patterns

### Pattern 1: Home Screen Data Loading

```typescript
useEffect(() => {
  const fetchData = async () => {
    const authenticatedFetch = tokenService.createAuthenticatedFetch();
    const response = await authenticatedFetch(`${API_BASE_URL}/driver/profile`);
    const data = await response.json();
    setDriverName(data.profile.name);
    setStatus(data.profile.status);
  };
  fetchData();
}, []);
```

### Pattern 2: Backend Protected Endpoint

```typescript
@UseGuards(JwtAuthGuard)
@Get('my-endpoint')
async myEndpoint(@Req() req: AuthenticatedRequest) {
  const driverId = parseInt(req.user.sub, 10);
  return this.myService.getDataForDriver(driverId);
}
```

### Pattern 3: Error Handling

```typescript
try {
  const data = await fetchData();
} catch (error) {
  console.error("Error:", error);
  // Fallback to auth store data
  if (user) {
    setDriverName(user.name);
  }
}
```

## 🔍 Debugging Commands

### Check Token Contents

```typescript
// Mobile app
const payload = await tokenService.getTokenPayload();
console.log("Driver ID:", payload.sub);
console.log("Phone:", payload.phone);
console.log("Expires:", new Date(payload.exp * 1000));
```

### Verify Authentication

```typescript
// Mobile app
const isValid = await tokenService.isTokenValid();
console.log("Token valid:", isValid);

const driverId = await tokenService.getDriverIdFromToken();
console.log("Driver ID:", driverId);
```

## ⚠️ Common Errors & Solutions

### Error: "No authentication token available"

**Solution:** User needs to log in

```typescript
const { isLoggedIn } = useAuthStore();
if (!isLoggedIn) {
  router.push("/auth/phone-auth");
}
```

### Error: "User not found"

**Solution:** Token references deleted/invalid driver

```typescript
const { logout } = useAuthStore();
await logout();
router.push("/auth/phone-auth");
```

### Error: 401 Unauthorized

**Solution:** Token expired or invalid

```typescript
const newToken = await tokenService.refreshToken();
if (!newToken) {
  // Force re-login
  await logout();
}
```

## 📝 Migration Checklist

If you have old code that uses hardcoded driver IDs:

- [ ] Remove `const driverId = 1;` or `const driverId = 2;`
- [ ] Update API function calls to remove driverId parameters
- [ ] Add `useAuthStore()` to access user data
- [ ] Add error handling with fallback to auth store
- [ ] Test with different driver accounts

## 🎯 Best Practices

1. **Always use tokenService for authenticated calls**

   ```typescript
   const authenticatedFetch = tokenService.createAuthenticatedFetch();
   ```

2. **Never hardcode driver IDs**

   ```typescript
   // ❌ BAD
   const driverId = 1;

   // ✅ GOOD
   const { user } = useAuthStore();
   const driverId = user.id;
   ```

3. **Add JWT guard to all driver endpoints**

   ```typescript
   @UseGuards(JwtAuthGuard)
   @Get('endpoint')
   ```

4. **Extract driver ID from token on backend**

   ```typescript
   const driverId = req.user.sub;
   ```

5. **Provide fallbacks for offline scenarios**
   ```typescript
   const { user } = useAuthStore();
   const name = apiData?.name || user?.name || "Driver";
   ```

## 🔗 Related Files

### Mobile App

- Token Service: `mobile-driver/lib/services/token.service.ts`
- Auth Store: `mobile-driver/lib/stores/auth.store.ts`
- Profile API: `mobile-driver/lib/api/profile.api.ts`

### Backend

- Driver Controller: `backend/src/driver/driver.controller.ts`
- JWT Strategy: `backend/src/auth/strategies/jwt.strategy.ts`
- Auth Service: `backend/src/auth/auth.service.ts`

---

_Quick reference for YathraGo driver authentication implementation_
