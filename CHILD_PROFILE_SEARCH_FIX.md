# Child Profile Search Fix

## Issue
When searching for vehicles with a child profile, the app showed this error:
```
ERROR  Error searching vehicles: [Error: Child ID is required for child profile search]
```

Staff profiles worked correctly, but child profiles failed.

## Root Cause
The profile IDs stored in the frontend use prefixes to distinguish between profile types:
- Child profiles: `"child-6"`, `"child-7"`, etc.
- Staff profiles: `"staff-4"`, etc.

When sending the search request to the backend, we were sending the full prefixed ID (e.g., `"child-6"`), but the backend expected a numeric child_id (e.g., `6`).

### Where Prefixes Are Added
In `mobile-customer/lib/api/profile.api.ts`, the profile API adds prefixes:
```typescript
// Add children profiles with prefixed IDs to avoid conflicts
if (data.profile.children && Array.isArray(data.profile.children)) {
  profiles.push(...data.profile.children.map((child: any, index: number) => ({
    ...child,
    id: `child-${child.child_id || index}`,  // <-- Prefix added here
    firstName: child.childFirstName,
    lastName: child.childLastName,
    type: 'child' as const,
  })));
}

// Add staff profile if exists with prefixed ID
if (data.profile.staffPassenger) {
  profiles.push({
    ...data.profile.staffPassenger,
    id: `staff-${data.profile.staffPassenger.id}`,  // <-- Prefix added here
    firstName: data.profile.firstName || '',
    lastName: data.profile.lastName || '',
    type: 'staff' as const,
  });
}
```

## Solution
Strip the prefix before sending to the backend API.

### Code Change
**File:** `mobile-customer/app/(menu)/(homeCards)/find_vehicle.tsx`

**Before:**
```typescript
const searchVehicles = async () => {
  // ...
  if (profileType === 'child') {
    profileId = parseInt(activeProfile.id);  // ❌ This fails for "child-6"
  } else {
    profileId = parseInt(activeProfile.id);  // ❌ This fails for "staff-4"
  }
  // ...
};
```

**After:**
```typescript
const searchVehicles = async () => {
  // ...
  if (profileType === 'child') {
    // Remove "child-" prefix and parse the number
    const idStr = activeProfile.id.replace('child-', '');
    profileId = parseInt(idStr, 10);  // ✅ Now "child-6" becomes 6
  } else {
    // Remove "staff-" prefix and parse the number
    const idStr = activeProfile.id.replace('staff-', '');
    profileId = parseInt(idStr, 10);  // ✅ Now "staff-4" becomes 4
  }
  
  console.log(`Searching vehicles for ${profileType} profile with ID: ${profileId}`);
  // ...
};
```

## Testing

### Test Cases
1. ✅ **Staff Profile Search**
   - Active profile: `{id: "staff-4", type: "staff"}`
   - Extracted ID: `4`
   - Backend receives: `profileType=staff&profileId=4`
   - Result: Works correctly

2. ✅ **Child Profile Search**
   - Active profile: `{id: "child-6", type: "child"}`
   - Extracted ID: `6`
   - Backend receives: `profileType=child&profileId=6`
   - Result: Now works correctly (previously failed)

### How to Test
1. Open the mobile app
2. Login with a customer account that has children
3. Switch to a **child profile**
4. Navigate to "Find New Vehicle"
5. Should see vehicles load without errors
6. Switch to **staff profile** and verify it still works

## Console Logs
Added helpful debug logging:
```
Searching vehicles for child profile with ID: 6
Found 5 vehicles
```

## Why Use Prefixes?
The prefixes prevent ID collisions in the frontend store:
- Child ID 4 and Staff ID 4 are different entities
- Prefixes make them unique: `"child-4"` vs `"staff-4"`
- This is a frontend-only concern - backend uses separate tables

## Related Files
- `mobile-customer/lib/api/profile.api.ts` - Where prefixes are added
- `mobile-customer/app/(menu)/(homeCards)/find_vehicle.tsx` - Where prefixes are stripped
- `backend/src/find-vehicle/find-vehicle.service.ts` - Expects numeric IDs

## Status
✅ **Fixed** - Child profile search now works correctly alongside staff profile search
