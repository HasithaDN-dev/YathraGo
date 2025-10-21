# Location Tracking Debug Guide

## Issue: "Missing profile ID or route ID for location tracking"

### Problem
The driver app shows the error: `❌ Missing profile ID or route ID for location tracking` when starting a route.

### Root Cause
When `handleStartRide()` is called, one of these conditions is not met:
1. `profile?.id` is undefined
2. `routeData?.route?.id` is undefined

### Debugging Steps

#### 1. Check Console Output
After clicking "Start Morning Route" or "Start Evening Route", check the console for:

```
🔍 Checking location tracking requirements: {
  hasProfile: true/false,
  profileId: <number or undefined>,
  hasRouteData: true/false,
  hasRoute: true/false,
  routeId: <number or undefined>,
  fullRouteData: { ... }
}
```

#### 2. Possible Issues

##### Issue A: Profile Not Loaded
**Symptoms:**
- `hasProfile: false` or `profileId: undefined`

**Solution:**
1. Check if driver is properly logged in
2. Verify driver profile was loaded on app startup
3. Check `useDriverStore` state in the app
4. Ensure `loadProfile()` was called after login

##### Issue B: Route Data Structure Mismatch
**Symptoms:**
- `hasRouteData: true` but `hasRoute: false` or `routeId: undefined`

**Solution:**
1. Check the backend response structure in the console (`fullRouteData`)
2. Verify backend is returning:
   ```typescript
   {
     success: true,
     route: {
       id: <number>,
       driverId: <number>,
       // ... other fields
     },
     stops: [ ... ]
   }
   ```
3. Ensure the backend `getTodaysRoute()` method returns the complete route object with `id`

##### Issue C: Backend Not Started or Connection Failed
**Symptoms:**
- Request fails before reaching location tracking logic
- Console shows network errors

**Solution:**
1. Ensure backend is running: `cd backend && npm run start:dev`
2. Check API_URL in driver app environment
3. Verify network connectivity

### Code Structure

#### Driver App Flow
```
navigation.tsx
  ↓
handleStartRide()
  ↓
routeApi.getTodaysRoute() → Returns DailyRoute
  ↓
Check: profile?.id && routeData?.route?.id
  ↓
driverLocationService.startLocationTracking()
```

#### Expected Data Structure

**Profile (from useDriverStore):**
```typescript
{
  id: number,
  firstName: string,
  lastName: string,
  // ... other fields
}
```

**Route Data (from routeApi.getTodaysRoute):**
```typescript
{
  success: boolean,
  route: {
    id: number,           // ← This is critical
    driverId: number,
    date: string,
    routeType: string,
    status: 'IN_PROGRESS',
    totalDistanceMeters: number,
    totalDurationSecs: number,
    optimizedPolyline: string | null
  },
  stops: RouteStop[]
}
```

### Testing Checklist

- [ ] Backend is running on correct port
- [ ] Driver is logged in
- [ ] Driver profile loaded successfully
- [ ] Driver has assigned students with confirmed ride requests
- [ ] At least one student marked as present for today
- [ ] Backend returns route with valid `id` field
- [ ] Location permissions granted on device
- [ ] WebSocket connection to `/driver-location` namespace working

### Quick Fix Commands

**Restart Backend:**
```powershell
cd backend
npm run start:dev
```

**Clear Driver App Cache:**
```powershell
cd mobile-driver
npm run start:clear
```

**Check Backend Logs:**
Look for route creation logs showing the route ID being generated.

### API Testing

You can test the backend endpoint manually:

```bash
# Get today's route
POST http://localhost:3000/driver/route/today
Headers:
  Authorization: Bearer <driver_token>
  Content-Type: application/json
Body:
{
  "routeType": "MORNING_PICKUP",
  "latitude": 6.9271,
  "longitude": 79.8612
}
```

Expected response should include `route.id`.

### Recent Changes

**File:** `mobile-driver/app/(tabs)/navigation.tsx`
- Added detailed console logging to debug the issue
- Shows all relevant values when location tracking fails

**What to Look For:**
After starting a route, you should see detailed debug output showing:
- Whether profile exists and its ID
- Whether route data exists and its structure
- The actual route ID value
- Which value is missing (if any)

### Next Steps

1. Run the driver app
2. Click "Start Morning Route" or "Start Evening Route"
3. Check the console output for the debug logs
4. Share the `🔍 Checking location tracking requirements:` output
5. Based on the output, we can identify exactly which value is missing and why
