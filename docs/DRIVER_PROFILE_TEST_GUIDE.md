# Driver Profile Integration Test Guide

## Overview
This guide will help you test the complete driver profile data integration from backend to frontend.

## Prerequisites
1. Backend server running on `http://localhost:3000`
2. Mobile driver app running (Expo)
3. Database has driver record with `driver_id = 1`

## Changes Made

### 1. Backend
- **Endpoint**: `GET /driver/profile/:driverId`
- **Location**: `backend/src/driver/driver.controller.ts` (Lines 147-153)
- **Status**: ✅ Already activated (uncommented)

### 2. Frontend - Type Definitions
- **File**: `mobile-driver/types/driver.types.ts`
- **Added**: `DriverProfileComplete` interface
- **Includes**: All driver fields from Prisma schema

### 3. Frontend - API Service
- **File**: `mobile-driver/lib/api/profile.api.ts`
- **Added**: `getDriverProfileById(driverId: number)` method
- **No Authentication**: Uses hardcoded driver ID for testing

### 4. Frontend - Profile Screen
- **File**: `mobile-driver/app/profile/(personal)/personal.tsx`
- **Changes**:
  - Fetches driver data on mount
  - Displays real data from backend
  - Shows profile picture from database
  - Maintains existing UI layout
  - Handles loading and error states

### 5. Frontend - Reusable Component
- **File**: `mobile-driver/components/ProfileImage.tsx`
- **Purpose**: Reusable profile picture component
- **Used in**: menu.tsx and personal.tsx

### 6. Frontend - Menu Screen
- **File**: `mobile-driver/app/(tabs)/menu.tsx`
- **Updated**: Uses `ProfileImage` component

## Testing Steps

### Step 1: Verify Backend Data
```bash
# Using curl or Postman
curl http://localhost:3000/driver/profile/1
```

Expected response:
```json
{
  "success": true,
  "profile": {
    "driver_id": 1,
    "name": "John Doe",
    "phone": "0771234567",
    "email": "john@example.com",
    "NIC": "123456789V",
    "address": "123 Main St, Colombo",
    "gender": "Male",
    "second_phone": "0779876543",
    "profile_picture_url": "http://...",
    "driver_license_front_url": "http://...",
    "driver_license_back_url": "http://...",
    "nic_front_pic_url": "http://...",
    "nice_back_pic_url": "http://...",
    "vehicle_Reg_No": "ABC-1234",
    "status": "ACTIVE",
    ...
  }
}
```

### Step 2: Test Mobile App

#### A. Personal Details Screen
1. Navigate to **Profile** tab → **Personal Details**
2. **Verify**:
   - Loading spinner appears briefly
   - Profile picture displays (from database or default fallback)
   - Name displays correctly
   - All fields populate with real data:
     - First Name (extracted from full name)
     - Last Name (extracted from full name)
     - NIC
     - Address
     - Gender
     - Phone Number
     - Email (or "Not provided")
     - Secondary Phone Number

#### B. Menu Screen
1. Navigate to **Menu** tab
2. **Verify**:
   - Profile picture displays (from database or default fallback)
   - Driver name displays correctly

### Step 3: Test Error Handling

#### A. Backend Offline
1. Stop the backend server
2. Navigate to Personal Details screen
3. **Verify**:
   - Error message displays: "Failed to load profile data"
   - "Retry" button appears
   - Click Retry when backend is back online

#### B. Invalid Driver ID
- Currently hardcoded to 1, so this won't occur
- If you change the ID to non-existent value, should show error

### Step 4: Test Image Loading

#### A. Valid Profile Picture URL
1. Ensure driver_id=1 has a valid `profile_picture_url` in database
2. **Verify**:
   - Image loads in personal details screen
   - Image loads in menu screen
   - No broken image icons

#### B. Missing Profile Picture
1. Set `profile_picture_url` to NULL or empty string in database
2. **Verify**:
   - Default profile image displays (profile.png.jpeg)
   - No errors in console

### Step 5: Verify Data Mapping

Check the following field mappings:
- `name` → Displays as full name and split into First/Last
- `phone` → Phone Number field
- `second_phone` → Secondary Phone Number field
- `email` → Email field (shows "Not provided" if null)
- `NIC` → NIC field
- `address` → Address field
- `gender` → Gender field

## Known Configuration

### Hardcoded Values
- **Driver ID**: `1` (hardcoded in both personal.tsx and ProfileImage.tsx)
- **Country**: "Sri Lanka" (hardcoded display value)

### API Base URL
- Configured in: `mobile-driver/config/api.ts`
- Default: `http://localhost:3000`

## Troubleshooting

### Issue: Profile data not loading
**Solutions**:
1. Check backend is running on port 3000
2. Verify driver_id=1 exists in database
3. Check console for API errors
4. Verify API_BASE_URL in config/api.ts

### Issue: Images not displaying
**Solutions**:
1. Check image URLs are accessible
2. Verify URLs are absolute (http/https)
3. Check React Native can access the URLs
4. For local images, ensure they're on accessible network

### Issue: Fields showing "undefined"
**Solutions**:
1. Check backend response structure matches `DriverProfileComplete` type
2. Verify database has data for all required fields
3. Check console for type mismatches

## File Checklist

Modified Files:
- ✅ `mobile-driver/types/driver.types.ts`
- ✅ `mobile-driver/lib/api/profile.api.ts`
- ✅ `mobile-driver/app/profile/(personal)/personal.tsx`
- ✅ `mobile-driver/components/ProfileImage.tsx` (NEW)
- ✅ `mobile-driver/app/(tabs)/menu.tsx`

Unchanged Backend Files (already activated):
- ✅ `backend/src/driver/driver.controller.ts`
- ✅ `backend/src/driver/driver.service.ts`

## Next Steps

### For Production Use:
1. Remove hardcoded driver ID
2. Use JWT authentication to get driver ID
3. Store driver profile in Zustand store for app-wide access
4. Add profile picture upload functionality
5. Add edit functionality for all fields
6. Implement proper error boundaries

### Additional Features:
1. Pull-to-refresh on profile screen
2. Cache profile data locally
3. Add skeleton loaders instead of spinner
4. Image optimization and caching
5. Profile completion percentage indicator

## Success Criteria

✅ Backend endpoint returns driver data for ID 1
✅ Personal Details screen displays all driver information
✅ Profile picture displays from database URL
✅ Default image shows when no profile picture exists
✅ Menu screen shows profile picture and name
✅ No TypeScript compilation errors
✅ Loading states work correctly
✅ Error handling displays properly
✅ UI layout unchanged from original design
