# VRP Optimizer Service - Driver Type Support Update

## Issue Fixed
The VRP optimizer service was still only fetching children from `ChildRideRequest`, causing the error:
```
Error: No present students assigned to this driver
```

This happened even for Work type drivers who have staff assigned.

## Changes Made to `vrp-optimizer.service.ts`

### 1. Updated `optimizeMorningRoute` Method (Line 63)
**Added driver type detection:**
```typescript
// Get driver's ride type
const driverCity = await this.prisma.driverCities.findFirst({
  where: { driverId },
  select: { rideType: true },
});
const driverRideType = driverCity?.rideType || 'School';

// Pass driver type to getPresentAssignedChildren
const presentChildren = await this.getPresentAssignedChildren(driverId, driverRideType);

// Dynamic error message
if (presentChildren.length === 0) {
  const passengerType = driverRideType === 'Work' ? 'staff members' : 'students';
  throw new Error(`No present ${passengerType} assigned to this driver`);
}
```

### 2. Updated `optimizeEveningRoute` Method (Line 124)
Same changes as morning route - added driver type detection and passed to `getPresentAssignedChildren`.

### 3. Updated `getPresentAssignedChildren` Method (Line 180)
**Added `rideType` parameter and conditional fetching:**

```typescript
private async getPresentAssignedChildren(
  driverId: number,
  rideType: string = 'School',
): Promise<PresentChild[]> {
  // For Work type drivers, fetch from StaffRideRequest
  if (rideType === 'Work') {
    const staffRequests = await this.prisma.staffRideRequest.findMany({
      where: { driverId, status: 'Assigned' },
      include: {
        staffPassenger: {
          select: {
            id: true,
            pickupLatitude: true,
            pickupLongitude: true,
            pickupAddress: true,
            workLatitude: true,
            workLongitude: true,
            workAddress: true,
            customer: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    // Map staff to PresentChild interface (using childId for compatibility)
    return staffRequests
      .filter((req) => 
        req.staffPassenger.pickupLatitude != null && 
        req.staffPassenger.pickupLongitude != null &&
        req.staffPassenger.workLatitude != null && 
        req.staffPassenger.workLongitude != null
      )
      .map((req) => ({
        childId: req.staffPassenger.id,
        childName: `${req.staffPassenger.customer.firstName} ${req.staffPassenger.customer.lastName}`,
        pickupLatitude: req.staffPassenger.pickupLatitude!,
        pickupLongitude: req.staffPassenger.pickupLongitude!,
        pickupAddress: req.staffPassenger.pickupAddress,
        schoolLatitude: req.staffPassenger.workLatitude!,
        schoolLongitude: req.staffPassenger.workLongitude!,
        schoolAddress: req.staffPassenger.workAddress,
      }));
  }

  // For School type drivers, fetch from ChildRideRequest (existing logic)
  // ... existing code for children ...
}
```

### 4. Updated `createFallbackResult` Method (Line 757)
**Added driver type detection for fallback routes:**

```typescript
private async createFallbackResult(driverId: number, routeType: 'morning' | 'evening'): Promise<VRPResult> {
  // Get driver's ride type
  const driverCity = await this.prisma.driverCities.findFirst({
    where: { driverId },
    select: { rideType: true },
  });
  const driverRideType = driverCity?.rideType || 'School';

  // Pass driver type to get correct passengers
  const presentChildren = await this.getPresentAssignedChildren(driverId, driverRideType);
  
  // ... rest of fallback logic ...
}
```

## How It Works

### For Work Type Drivers:
1. VRP optimizer calls `optimizeMorningRoute(driverId)`
2. Gets `rideType = 'Work'` from `DriverCities`
3. Calls `getPresentAssignedChildren(driverId, 'Work')`
4. Fetches from `StaffRideRequest` → `Staff_Passenger` → `Customer`
5. Maps staff data to `PresentChild` interface:
   - `childId` → `staffPassenger.id`
   - `schoolLatitude/Longitude` → `workLatitude/Longitude`
   - `schoolAddress` → `workAddress`
6. Same VRP optimization algorithm runs
7. Returns optimized route with staff stops

### For School Type Drivers:
1. Gets `rideType = 'School'` from `DriverCities`
2. Calls `getPresentAssignedChildren(driverId, 'School')`
3. Fetches from `ChildRideRequest` → `Child`
4. Filters out absent children
5. Returns children data as before

## Key Design Decision

**Reused `PresentChild` Interface:**
- No need to create separate staff interface
- Maps staff work locations to school fields
- Maintains compatibility with existing routing logic
- VRP algorithm doesn't need to know passenger type

## Result

✅ Work drivers can now start routes without "No present students assigned" error  
✅ Staff are correctly fetched and optimized by VRP  
✅ School drivers continue working as before  
✅ Same routing algorithm for both types  

## Testing

Run as Work type driver:
1. Press "Start Morning Route"
2. **Before**: Error "No present students assigned"
3. **After**: Route created with staff stops

Check logs:
```
[VRPOptimizerService] Starting morning route optimization for driver 12
[VRPOptimizerService] Built 6 morning nodes: pickup(5), dropoff(5), pickup(6), dropoff(6)...
[VRPOptimizerService] Morning route optimization completed for 3 staff members
```

## Files Modified

- `backend/src/driver-route/vrp-optimizer.service.ts`
  - `optimizeMorningRoute()` - Added driver type detection
  - `optimizeEveningRoute()` - Added driver type detection
  - `getPresentAssignedChildren()` - Added rideType parameter, staff fetching logic
  - `createFallbackResult()` - Added driver type detection

## Complete Implementation

Both services now respect driver type:
- ✅ `driver-route.service.ts` - Main route service
- ✅ `vrp-optimizer.service.ts` - VRP optimization service

**Status**: 🎉 Complete! Work drivers can now create and optimize routes with staff passengers.
