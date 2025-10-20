# Fix: Staff Names Not Showing in Routes

## Issue Identified
When a Work driver started a route, the backend was returning correct staff IDs (1, 2, 3, 4) but the mobile app was showing **children names** instead of staff names. This happened because:

1. ✅ Staff IDs were correctly saved in `RouteStop.childId` field
2. ✅ Route optimization worked with staff data
3. ❌ But when returning the route to the frontend, code was only querying the `Child` table, not `Staff_Passenger` table

## Root Cause
The `getTodaysRoute` method had two places where it returned route data:

1. **Existing Route** (if route already created today)
   - Only joined with `Child` table
   - Mapped `stop.child.childFirstName` and `stop.child.childLastName`

2. **New Route** (after optimization)
   - Only joined with `Child` table
   - Mapped `stop.child.childFirstName` and `stop.child.childLastName`

Since Work drivers have **staff IDs** in `RouteStop.childId`, querying the `Child` table with those IDs would either:
- Return wrong children (if child_id happened to match staff ID)
- Return null/undefined

## Solution Implemented

### 1. Created New Helper Method: `formatStopsWithPassengerData`

This method checks the driver's ride type and fetches passenger data from the appropriate table:

```typescript
private async formatStopsWithPassengerData(
  stops: any[],
  rideType: string,
): Promise<any[]> {
  if (rideType === 'Work') {
    // For Work drivers, fetch staff data
    const staffIds = stops.map((stop) => stop.childId); // childId is actually staffId
    const staffData = await this.prisma.staff_Passenger.findMany({
      where: { id: { in: staffIds } },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Map staff IDs to names
    const staffMap = new Map(
      staffData.map((staff) => [
        staff.id,
        {
          name: `${staff.customer.firstName} ${staff.customer.lastName}`,
          image: null,
        },
      ]),
    );

    // Format stops with staff names
    return stops.map((stop) => {
      const staff = staffMap.get(stop.childId);
      return {
        stopId: stop.id,
        childId: stop.childId, // Actually staffId
        childName: staff?.name || 'Unknown Staff',
        childImage: staff?.image || null,
        // ... other fields
      };
    });
  }

  // For School drivers, fetch child data from Child table
  // ... existing child logic ...
}
```

**Key Points:**
- For Work drivers: Queries `Staff_Passenger` table using `staff.id`
- Joins with `Customer` table to get `firstName` and `lastName`
- Creates a Map for efficient lookup
- For School drivers: Queries `Child` table as before

### 2. Updated `getTodaysRoute` - Existing Route Path

**Before:**
```typescript
const existingRoute = await this.prisma.driverRoute.findUnique({
  include: {
    stops: {
      include: {
        child: { select: { ... } } // Only Child table
      }
    }
  }
});

return {
  stops: existingRoute.stops.map(stop => ({
    childName: `${stop.child.childFirstName} ${stop.child.childLastName}` // Wrong for staff!
  }))
};
```

**After:**
```typescript
const existingRoute = await this.prisma.driverRoute.findUnique({
  include: {
    stops: {
      orderBy: { order: 'asc' }
      // No child relation included
    }
  }
});

// Format stops based on driver type
const formattedStops = await this.formatStopsWithPassengerData(
  existingRoute.stops,
  driverRideType,
);

return {
  success: true,
  route: existingRoute,
  stops: formattedStops, // Correct passenger names
};
```

### 3. Updated `getTodaysRoute` - New Route Path

**Before:**
```typescript
const savedRoute = await this.saveRouteToDatabase(...);

return {
  stops: savedRoute.stops.map(stop => ({
    childName: `${stop.child.childFirstName} ${stop.child.childLastName}` // Wrong for staff!
  }))
};
```

**After:**
```typescript
const savedRoute = await this.saveRouteToDatabase(...);

// Format stops based on driver type
const formattedStops = await this.formatStopsWithPassengerData(
  savedRoute?.stops || [],
  driverRideType,
);

return {
  success: true,
  route: savedRoute,
  stops: formattedStops, // Correct passenger names
};
```

### 4. Updated `saveRouteToDatabase`

**Before:**
```typescript
return this.prisma.driverRoute.findUnique({
  include: {
    stops: {
      include: {
        child: { select: { ... } } // Only Child table
      }
    }
  }
});
```

**After:**
```typescript
return this.prisma.driverRoute.findUnique({
  include: {
    stops: {
      orderBy: { order: 'asc' }
      // No child relation - handled by formatStopsWithPassengerData
    }
  }
});
```

## Data Flow

### For Work Type Driver:

1. **Start Morning Route**
   ```
   GET /driver/route/today
   ```

2. **Backend Processing**
   ```
   getTodaysRoute(driverId, routeType, lat, lng)
   ├─ Get driver's rideType from DriverCities → 'Work'
   ├─ Check existing route for today
   │  ├─ Find route with stops (no child relation)
   │  └─ formatStopsWithPassengerData(stops, 'Work')
   │     ├─ Extract staff IDs: [1, 2, 3, 4]
   │     ├─ Query Staff_Passenger table: WHERE id IN (1,2,3,4)
   │     ├─ Join with Customer table for names
   │     └─ Map: 1→"John Doe", 2→"Jane Smith", ...
   └─ Return formatted stops with staff names
   ```

3. **Mobile App Receives**
   ```json
   {
     "success": true,
     "stops": [
       {
         "stopId": 123,
         "childId": 1,
         "childName": "John Doe",  // ✅ Correct staff name!
         "type": "PICKUP",
         "address": "123 Home St"
       },
       {
         "stopId": 124,
         "childId": 1,
         "childName": "John Doe",
         "type": "DROPOFF",
         "address": "456 Office Blvd"
       }
     ]
   }
   ```

### For School Type Driver:

Same flow but `formatStopsWithPassengerData` queries `Child` table instead:
```
formatStopsWithPassengerData(stops, 'School')
├─ Extract child IDs: [10, 11, 12]
├─ Query Child table: WHERE child_id IN (10,11,12)
└─ Map: 10→"Alice Brown", 11→"Bob Wilson", ...
```

## Database Schema Reference

### Staff_Passenger Table
```prisma
model Staff_Passenger {
  id               Int       @id
  customerId       Int       @unique
  pickupLatitude   Float?
  pickupLongitude  Float?
  workLatitude     Float?
  workLongitude    Float?
  // Relations
  customer         Customer  @relation("CustomerStaffPassenger")
}
```

### Customer Table
```prisma
model Customer {
  customer_id      Int       @id
  firstName        String
  lastName         String
  // Relations
  staffPassenger   Staff_Passenger?
}
```

### RouteStop Table
```prisma
model RouteStop {
  id              Int       @id
  driverRouteId   Int
  childId         Int       // ⚠️ Used for both child_id AND staff_id
  type            String    // PICKUP or DROPOFF
  // ...other fields
}
```

## Why This Fix Works

### The Problem:
- `RouteStop.childId` holds **staff IDs** for Work drivers
- But code was querying `Child` table using those IDs
- Result: Wrong names or no names

### The Solution:
- Check driver's `rideType` before querying
- If `rideType = 'Work'` → Query `Staff_Passenger` table
- If `rideType = 'School'` → Query `Child` table
- Use the correct passenger names for each driver type

## Files Modified

### backend/src/driver-route/driver-route.service.ts

**Added Method:**
- `formatStopsWithPassengerData()` - Line ~190

**Updated Methods:**
- `getTodaysRoute()` - Lines 86-122 (existing route) and 164-186 (new route)
- `saveRouteToDatabase()` - Line ~960 (removed child relation)

**Changes:**
- Removed child relation from route queries
- Added `formatStopsWithPassengerData` calls for both code paths
- Staff names now correctly fetched from Staff_Passenger → Customer

## Testing

### Verify Staff Names:

1. **Database Check:**
   ```sql
   -- Check staff assigned to driver
   SELECT 
     sr.driverId,
     sp.id as staff_id,
     c.firstName,
     c.lastName
   FROM "StaffRideRequest" sr
   JOIN "Staff_Passenger" sp ON sr.staffId = sp.id
   JOIN "Customer" c ON sp.customerId = c.customer_id
   WHERE sr.driverId = YOUR_DRIVER_ID;
   ```

2. **API Test:**
   ```bash
   curl -X POST http://localhost:3000/driver/route/today \
     -H "Authorization: Bearer YOUR_JWT" \
     -H "Content-Type: application/json" \
     -d '{"routeType": "MORNING_PICKUP"}'
   ```

3. **Expected Response:**
   ```json
   {
     "success": true,
     "stops": [
       {
         "childName": "John Doe",  // Staff first name + last name
         "type": "PICKUP"
       }
     ]
   }
   ```

### In Mobile App:

1. Login as Work driver
2. Press "Start Morning Route"
3. **Before Fix**: Saw wrong child names or blank names
4. **After Fix**: Should see correct staff names (John Doe, Jane Smith, etc.)

## Summary

✅ **Root Cause**: Route retrieval only queried Child table, not Staff_Passenger  
✅ **Solution**: Created `formatStopsWithPassengerData` helper that queries correct table based on driver type  
✅ **Result**: Work drivers now see staff names, School drivers still see child names  
✅ **Files Changed**: 1 file (`driver-route.service.ts`)  
✅ **Methods Added**: 1 (`formatStopsWithPassengerData`)  
✅ **Methods Updated**: 2 (`getTodaysRoute`, `saveRouteToDatabase`)  

**Status**: 🎉 Fixed! Staff names now display correctly in routes for Work type drivers.
