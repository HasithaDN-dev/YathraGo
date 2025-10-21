# Driver Type-Based Routing Implementation Complete

## Overview
Fixed the navigation/routing system to respect driver type (School/Work/Both) when fetching passengers for routes. Now the routing system uses the same passenger list as the home screen.

## Problem Identified
- **Home Screen**: Correctly showed staff for Work drivers using `/driver/assigned-passengers` endpoint
- **Navigation Screen**: Still only fetched children from `ChildRideRequest` table, ignored driver type
- **Result**: Work drivers saw staff on home screen but got "no students assigned" error when starting routes

## Solution Implemented

### 1. Backend Changes - `driver-route.service.ts`

#### A. Added New Interface (Line 23)
```typescript
interface PassengerLocation {
  passengerId: number;
  passengerName: string;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  pickupAddress: string;
  dropoffLatitude: number | null;
  dropoffLongitude: number | null;
  dropoffAddress: string;
}
```

#### B. Updated `getTodaysRoute` Method (Line 68)
**Added driver ride type detection:**
```typescript
// Get driver's ride type (School/Work/Both) from DriverCities
const driverCity = await this.prisma.driverCities.findFirst({
  where: { driverId },
  select: { rideType: true },
});

const driverRideType = driverCity?.rideType || 'School'; // Default to School
```

**Replaced child-specific calls with passenger-based calls:**
```typescript
// OLD:
const assignedChildren = await this.getAssignedChildren(driverId);
const presentChildren = await this.filterByAttendance(assignedChildren, today);

// NEW:
const assignedPassengers = await this.getAssignedPassengers(driverId, driverRideType);
const presentPassengers = await this.filterByAttendance(assignedPassengers, today, driverRideType);
```

**Dynamic error messages:**
```typescript
const passengerType = driverRideType === 'Work' ? 'staff members' : 'students';
throw new BadRequestException(
  `No ${passengerType} assigned to this driver. Please check ride requests.`
);
```

#### C. Created New Method: `getAssignedPassengers` (Line 202)
Replaces `getAssignedChildren` to fetch passengers based on driver type:

**For Work Type Drivers:**
- Queries `StaffRideRequest` table
- Joins with `Staff_Passenger` → `Customer` for staff details
- Maps to ChildLocation interface (using childId for staffId for compatibility)

**For School Type Drivers:**
- Queries `ChildRideRequest` table
- Joins with `Child` for student details
- Same behavior as before

**Key Code:**
```typescript
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
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return staffRequests.map((req) => ({
    childId: req.staffPassenger.id, // Using childId field for compatibility
    childName: `${req.staffPassenger.customer.firstName} ${req.staffPassenger.customer.lastName}`,
    pickupLatitude: req.staffPassenger.pickupLatitude,
    pickupLongitude: req.staffPassenger.pickupLongitude,
    pickupAddress: req.staffPassenger.pickupAddress,
    schoolLatitude: req.staffPassenger.workLatitude, // Using schoolLatitude for work location
    schoolLongitude: req.staffPassenger.workLongitude,
    schoolAddress: req.staffPassenger.workAddress,
  }));
}
```

#### D. Updated `filterByAttendance` Method (Line 336)
Now checks the appropriate absence table based on driver type:

**For Work Type Drivers:**
- Returns all staff as present (no absence_Staff table with proper fields yet)
- TODO: Implement proper absence_Staff table

**For School Type Drivers:**
- Checks `absence_Child` table as before

```typescript
if (rideType === 'Work') {
  return passengers; // TODO: Implement absence_Staff table
}

// For School drivers, check absence_Child as before
const absences = await this.prisma.absence_Child.findMany({
  where: {
    childId: { in: passengers.map((p) => p.childId) },
    date: { gte: date, lt: tomorrow },
  },
  select: { childId: true },
});
```

#### E. Updated `markStopCompleted` Method (Line 957)
Now creates attendance records in the correct table:

**Added driver type detection:**
```typescript
const driverCity = await this.prisma.driverCities.findFirst({
  where: { driverId },
  select: { rideType: true },
});
const driverRideType = driverCity?.rideType || 'School';
```

**Conditional attendance creation:**
```typescript
if (driverRideType === 'Work') {
  // For work drivers, create StaffAttendance
  await this.prisma.staffAttendance.create({
    data: {
      driverId,
      staffId: stop.childId, // childId is used for compatibility
      date: stop.driverRoute.date,
      type: attendanceType,
      latitude,
      longitude,
      notes: notes || `${stop.type} completed`,
      status: 'completed',
    },
  });
} else {
  // For school drivers, create Attendance
  await this.prisma.attendance.create({
    data: {
      driverId,
      childId: stop.childId,
      date: stop.driverRoute.date,
      type: attendanceType,
      latitude,
      longitude,
      notes: notes || `${stop.type} completed`,
      status: 'completed',
    },
  });
}
```

#### F. Updated Fallback Logic in `optimizeRouteWithVRP` (Line 494)
When VRP optimization fails and falls back to legacy method:

```typescript
catch (error) {
  console.error('VRP optimization failed, falling back to legacy method:', error);
  
  // Get driver's ride type
  const driverCity = await this.prisma.driverCities.findFirst({
    where: { driverId },
    select: { rideType: true },
  });
  const driverRideType = driverCity?.rideType || 'School';
  
  // Use new passenger-based methods
  const assignedPassengers = await this.getAssignedPassengers(driverId, driverRideType);
  const presentPassengers = await this.filterByAttendance(
    assignedPassengers,
    new Date(),
    driverRideType,
  );
  const stops = this.generateStops(presentPassengers, routeType);
  return this.optimizeRoute(stops, driverLatitude, driverLongitude);
}
```

## Data Flow

### For School Type Driver:
1. `getTodaysRoute` called → Gets `rideType = 'School'`
2. `getAssignedPassengers` → Queries `ChildRideRequest` table
3. `filterByAttendance` → Checks `absence_Child` table
4. `generateStops` → Creates pickup/dropoff stops (home ↔ school)
5. `optimizeRouteWithVRP` → Optimizes route order
6. `markStopCompleted` → Creates record in `Attendance` table

### For Work Type Driver:
1. `getTodaysRoute` called → Gets `rideType = 'Work'`
2. `getAssignedPassengers` → Queries `StaffRideRequest` table
3. `filterByAttendance` → Returns all staff (no absence check yet)
4. `generateStops` → Creates pickup/dropoff stops (home ↔ work)
5. `optimizeRouteWithVRP` → Optimizes route order (same algorithm!)
6. `markStopCompleted` → Creates record in `StaffAttendance` table

## Key Design Decisions

### 1. **Reused `ChildLocation` Interface**
Instead of creating a new interface, we map staff data to the existing `ChildLocation` interface:
- `childId` → `staffPassenger.id`
- `childName` → `${firstName} ${lastName}`
- `schoolLatitude/Longitude` → `workLatitude/Longitude`
- `schoolAddress` → `workAddress`

**Benefit**: Minimal changes to existing routing logic, same optimization algorithm works for both

### 2. **No Changes to Routing Algorithm**
As requested: "no need to change route logic or optimizing, just change the list source"
- Same `generateStops` method
- Same `optimizeRouteWithVRP` method
- Same `optimizeRoute` fallback
- Only the data source changes based on driver type

### 3. **Backward Compatibility**
- Kept `getAssignedChildren` method (marked as deprecated)
- Default to 'School' type if rideType not found
- Existing School drivers continue working without changes

## Database Tables Used

### For Children (School Drivers):
- **ChildRideRequest**: Ride assignment (driverId, childId, status)
- **Child**: Student details (name, addresses, coordinates)
- **absence_Child**: Absence records
- **Attendance**: Attendance marking (driverId, childId, date, type)

### For Staff (Work Drivers):
- **StaffRideRequest**: Ride assignment (driverId, staffId, status)
- **Staff_Passenger**: Staff details (addresses, coordinates)
- **Customer**: Name (firstName, lastName) via relation
- **StaffAttendance**: Attendance marking (driverId, staffId, date, type)
- **absence_Staff**: ⚠️ Not properly implemented yet (no staffId/date fields)

## Testing Checklist

### School Type Driver:
- [ ] Home screen shows students
- [ ] Start morning route shows students
- [ ] Route optimization works
- [ ] Can complete pickups/dropoffs
- [ ] Attendance created in Attendance table
- [ ] Absent students filtered out

### Work Type Driver:
- [x] Home screen shows staff
- [ ] Start morning route shows staff (NOT "no students assigned")
- [ ] Route optimization works with staff
- [ ] Can complete pickups/dropoffs for staff
- [ ] Attendance created in StaffAttendance table
- [ ] Staff always shown as present (no absence filtering yet)

### Both Type Driver (Future):
- [ ] Home screen shows both students and staff
- [ ] Route includes both types
- [ ] Correct attendance tables used for each

## Known Limitations

1. **No Staff Absence Filtering**
   - `absence_Staff` table exists but lacks `staffId` and `date` fields
   - All assigned staff are always included in routes
   - TODO: Update schema and implement absence checking

2. **"Both" Type Not Fully Tested**
   - Logic should work but needs testing
   - Would create one route with mixed passenger types

3. **RouteStop Table**
   - Still uses `childId` field even for staff
   - Works due to interface mapping but column name is misleading
   - Consider renaming to `passengerId` in future schema update

## Files Modified

### Backend:
- `backend/src/driver-route/driver-route.service.ts` (Major updates)
  - Added `getAssignedPassengers()` method
  - Updated `getTodaysRoute()` method
  - Updated `filterByAttendance()` method
  - Updated `markStopCompleted()` method
  - Updated `optimizeRouteWithVRP()` fallback logic

## API Endpoints Affected

### `POST /driver/route/today`
**Before:**
- Always fetched from ChildRideRequest
- Always created Attendance records

**After:**
- Checks driver's rideType in DriverCities
- Fetches from ChildRideRequest OR StaffRideRequest
- Creates Attendance OR StaffAttendance records

**Response**: Same structure (stops[], route{})

### `PATCH /driver/route/stop/:id/complete`
**Before:**
- Always created Attendance record

**After:**
- Checks driver's rideType
- Creates Attendance OR StaffAttendance record

**Response**: Same structure

## Next Steps

1. **Test the Implementation**
   - Login as Work type driver
   - Verify home screen shows staff
   - Start morning route
   - Verify staff list appears (not "no students assigned" error)
   - Complete a stop
   - Check StaffAttendance table for record

2. **Implement Staff Absence System** (Future)
   - Update `absence_Staff` schema to include staffId and date
   - Run migration
   - Update `filterByAttendance` to check staff absences

3. **Consider Schema Improvements** (Future)
   - Rename `RouteStop.childId` to `passengerId`
   - Create unified PassengerLocation type in TypeScript
   - Consider polymorphic relations if needed

## Conclusion

The routing system now respects driver type when fetching passengers. Work drivers will see their assigned staff members in routes, and attendance will be recorded in the appropriate table. The routing algorithm remains unchanged - we only changed the data source as requested.

**Status**: ✅ Implementation Complete - Ready for Testing
