# Driver Search UI Integration Fixes

## Overview
Fixed issues with the driver search feature to ensure it works correctly in the mobile UI for both child and staff profiles, with client-side filtering instead of backend filtering.

## Issues Fixed

### 1. Backend Over-Filtering
**Problem:** Backend was filtering by vehicle type and driver rating, which could exclude valid drivers before proximity calculations.

**Solution:** 
- Removed `vehicleType` and `minRating` filtering from backend service
- Backend now only filters by:
  - Driver status (ACTIVE)
  - Registration status (ACCOUNT_CREATED or HAVING_A_PROFILE)
  - Route proximity (within 10km)
  - Ride type (School/Work/Both)
  - Route direction (drop-off after pickup)

### 2. Find Vehicle Card Not Showing for Child Profiles
**Problem:** The "Find New Vehicle" card was only displayed for staff profiles on the home screen.

**Solution:**
- Updated `mobile-customer/app/(tabs)/index.tsx` to show the card for all profiles
- Removed the conditional check that limited it to staff profiles only

### 3. Profile Data Loading Issues
**Problem:** The find vehicle screen was using AsyncStorage directly instead of the profile store.

**Solution:**
- Updated `find_vehicle.tsx` to use `useProfileStore` hook
- Gets `customerProfile` and `activeProfile` from the store
- Automatically extracts customerId, profileType, and profileId from active profile
- **Important:** Profile IDs are prefixed (e.g., `"child-6"`, `"staff-4"`), so we strip the prefix before sending to backend:
  ```typescript
  const idStr = activeProfile.id.replace('child-', ''); // or 'staff-'
  const profileId = parseInt(idStr, 10);
  ```

### 4. Client-Side Filtering Implementation
**Problem:** Filtering needed to be moved from backend to frontend for better UX.

**Solution:**
- Implemented `useMemo` hook to filter vehicles on the client side
- Filters applied:
  - Vehicle type (Van/Bus/All)
  - Minimum driver rating (1-5 stars)
- Users can see all available vehicles and filter in real-time without API calls

## Files Modified

### Backend
1. **`backend/src/find-vehicle/find-vehicle.service.ts`**
   - Removed vehicle type filtering logic
   - Removed driver rating filtering logic
   - Backend now returns ALL drivers matching proximity criteria

### Frontend API
2. **`mobile-customer/lib/api/find-vehicle.ts`**
   - Removed `vehicleType` and `minRating` from `VehicleSearchParams` interface
   - Removed these parameters from API call query string
   - API now only sends: customerId, profileType, profileId

### Mobile UI
3. **`mobile-customer/app/(menu)/(homeCards)/find_vehicle.tsx`**
   - Added `useMemo` hook for client-side filtering
   - Replaced AsyncStorage with `useProfileStore`
   - Implemented `filteredVehicles` computed property
   - Filter logic:
     ```typescript
     const filteredVehicles = useMemo(() => {
       let filtered = [...allVehicles];
       if (selectedVehicleType) {
         filtered = filtered.filter(v => v.vehicleType === selectedVehicleType);
       }
       if (rating > 1) {
         filtered = filtered.filter(v => v.driverRating >= rating);
       }
       return filtered;
     }, [allVehicles, selectedVehicleType, rating]);
     ```

4. **`mobile-customer/app/(tabs)/index.tsx`**
   - Removed conditional rendering for Find New Vehicle card
   - Card now displays for both child and staff profiles

## Testing Guide

### Test Backend
1. Start backend: `npm run start:dev`
2. Test with Postman:
   ```
   GET http://localhost:3000/find-vehicle/search?customerId=4&profileType=staff&profileId=4
   ```
3. Verify response includes ALL matching drivers (not filtered by vehicle type or rating)

### Test Mobile Frontend
1. Login to mobile app
2. Switch to a child profile
3. Verify "Find New Vehicle" card appears on home screen
4. Tap "Find New Vehicle"
5. Verify vehicles load from backend
6. Test filters:
   - Change vehicle type dropdown → vehicles filter instantly
   - Change rating dropdown → vehicles filter instantly
7. Switch to staff profile and repeat tests

## Expected Behavior

### Backend Response
- Returns all drivers within 10km of route
- Includes drivers with any vehicle type (Van, Bus, etc.)
- Includes drivers with any rating
- Sorted by distance from pickup point

### Frontend Display
- Shows all returned vehicles initially
- Filters update in real-time without API calls
- Empty state shows when no matches after filtering
- Loading state while fetching from API

## Architecture Benefits

### Previous (Backend Filtering)
❌ Backend filtered by vehicle type and rating  
❌ Each filter change required new API call  
❌ Couldn't see available options before filtering  
❌ Higher server load with multiple filter changes  

### Current (Client-Side Filtering)
✅ Backend returns all proximity-matched drivers  
✅ Filters applied instantly without API calls  
✅ Users can see all options and filter dynamically  
✅ Reduced server load, better UX  
✅ Works offline once data is loaded  

## Debug Logs

Backend logs show the filtering process:
```
[FindVehicle] Found 20 active drivers with complete profiles
[FindVehicle] Driver 14 (John Doe): Route check - Suitable: true, Pickup: 0.12km (seg 0), Drop: 1.45km (seg 2)
[FindVehicle] ✓ Driver 14 (John Doe) MATCHED!
[FindVehicle] Returning 5 matched drivers for child profile
```

## Notes
- Backend still validates route proximity (10km threshold)
- Backend still validates route direction (drop after pickup)
- Driver rating is currently placeholder (4.5) - needs integration with review system
- All filters are now client-side except proximity calculations

## Future Enhancements
1. Integrate real driver ratings from review table
2. Add more filter options (AC, assistant, seats)
3. Add sorting options (price, rating, distance)
4. Cache results to reduce API calls
5. Add map view showing driver routes
