# Driver Type-Based Routing - Testing Guide

## Quick Testing Steps

### Test 1: Work Driver - Morning Route
**Goal**: Verify Work driver can start route with staff (not "no students assigned" error)

1. **Setup**:
   - Ensure you have a Work type driver in database
   - Check `DriverCities` table: `rideType = 'Work'`
   - Ensure staff are assigned via `StaffRideRequest` with `status = 'Assigned'`

2. **Login as Work Driver**:
   ```
   Open mobile-driver app
   Login with Work driver credentials
   ```

3. **Check Home Screen**:
   ```
   Expected: Home tab shows "X Staff Members Assigned"
   Expected: List shows staff names and work locations
   ```

4. **Start Morning Route**:
   ```
   Tap "Navigation" tab
   Tap "Start Morning Route" button
   
   BEFORE FIX: Shows "No students assigned" error ❌
   AFTER FIX: Shows "You have X stops today..." ✅
   ```

5. **Verify Route List**:
   ```
   Expected: Route shows staff names
   Expected: Pickup locations are staff home addresses
   Expected: Dropoff locations are staff work addresses
   ```

6. **Complete a Stop**:
   ```
   Navigate to first stop
   Tap "Arrive" → "Mark Complete"
   
   Check database: SELECT * FROM "StaffAttendance" 
   Expected: New record with staffId, driverId, date, type
   ```

### Test 2: School Driver - Morning Route
**Goal**: Verify School drivers still work as before

1. **Setup**:
   - Use School type driver
   - Check `DriverCities` table: `rideType = 'School'`
   - Ensure children assigned via `ChildRideRequest`

2. **Login as School Driver**:
   ```
   Expected: Home shows "X Students Assigned"
   Expected: List shows children with school names
   ```

3. **Start Morning Route**:
   ```
   Tap "Start Morning Route"
   Expected: Shows students list
   Expected: Pickup = home, Dropoff = school
   ```

4. **Complete a Stop**:
   ```
   Check database: SELECT * FROM "Attendance"
   Expected: Record in Attendance table (NOT StaffAttendance)
   ```

## Database Verification Queries

### Check Driver Type:
```sql
SELECT d.driver_id, d.firstName, d.lastName, dc.rideType
FROM "Driver" d
LEFT JOIN "DriverCities" dc ON d.driver_id = dc.driverId
WHERE d.driver_id = YOUR_DRIVER_ID;
```

### Check Assigned Staff:
```sql
SELECT sr.*, sp.pickupAddress, sp.workAddress, c.firstName, c.lastName
FROM "StaffRideRequest" sr
JOIN "Staff_Passenger" sp ON sr.staffId = sp.id
JOIN "Customer" c ON sp.customerId = c.customer_id
WHERE sr.driverId = YOUR_DRIVER_ID AND sr.status = 'Assigned';
```

### Check Assigned Children:
```sql
SELECT cr.*, ch.childFirstName, ch.childLastName, ch.pickUpAddress, ch.school
FROM "ChildRideRequest" cr
JOIN "Child" ch ON cr.childId = ch.child_id
WHERE cr.driverId = YOUR_DRIVER_ID AND cr.status = 'Assigned';
```

### Check Today's Route:
```sql
SELECT dr.*, rs.*
FROM "DriverRoute" dr
LEFT JOIN "RouteStop" rs ON dr.id = rs.driverRouteId
WHERE dr.driverId = YOUR_DRIVER_ID 
  AND dr.date = CURRENT_DATE
ORDER BY rs."order";
```

### Check Attendance Records:
```sql
-- For School drivers:
SELECT * FROM "Attendance" 
WHERE driverId = YOUR_DRIVER_ID 
  AND date = CURRENT_DATE;

-- For Work drivers:
SELECT * FROM "StaffAttendance"
WHERE driverId = YOUR_DRIVER_ID
  AND date = CURRENT_DATE;
```

## API Testing with cURL

### Get Today's Route (as Work Driver):
```bash
curl -X POST http://localhost:3000/driver/route/today \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "routeType": "MORNING_PICKUP",
    "latitude": 6.9271,
    "longitude": 79.8612
  }'
```

**Expected Response for Work Driver:**
```json
{
  "success": true,
  "route": {
    "id": 123,
    "driverId": YOUR_DRIVER_ID,
    "date": "2024-01-15",
    "routeType": "MORNING_PICKUP",
    "status": "PENDING"
  },
  "stops": [
    {
      "stopId": 1,
      "childId": 5,  // Actually staff_passenger_id
      "childName": "John Doe",
      "type": "PICKUP",
      "address": "123 Staff Home Address",
      "latitude": 6.9271,
      "longitude": 79.8612
    },
    {
      "stopId": 2,
      "childId": 5,
      "childName": "John Doe",
      "type": "DROPOFF",
      "address": "456 Office Building",
      "latitude": 6.9370,
      "longitude": 79.8500
    }
  ]
}
```

### Mark Stop Complete (as Work Driver):
```bash
curl -X PATCH http://localhost:3000/driver/route/stop/1/complete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 6.9271,
    "longitude": 79.8612,
    "notes": "Pickup completed"
  }'
```

**Then check database:**
```sql
SELECT * FROM "StaffAttendance" WHERE staffId = 5 AND date = CURRENT_DATE;
```

## Common Issues & Solutions

### Issue 1: "No students assigned" for Work Driver
**Symptoms**: Work driver sees staff on home but gets error when starting route

**Causes**:
- Backend not restarted after code changes
- Prisma client not regenerated

**Solutions**:
```bash
cd backend
npx prisma generate
npm run start:dev
```

### Issue 2: TypeError with staffPassenger
**Symptoms**: Backend error: "Cannot read property 'customer' of undefined"

**Causes**:
- StaffRideRequest missing relation data
- Wrong relation name in query

**Solutions**:
- Check Prisma schema relation names
- Verify `staffPassenger` relation exists in schema
- Run: `npx prisma db pull` then `npx prisma generate`

### Issue 3: Attendance not created
**Symptoms**: Route completes but no StaffAttendance record

**Causes**:
- Driver type detection failing
- Defaulting to 'School' type

**Debug**:
```typescript
// Add logging in markStopCompleted:
console.log('Driver ride type:', driverRideType);
console.log('Creating attendance in:', driverRideType === 'Work' ? 'StaffAttendance' : 'Attendance');
```

### Issue 4: Both type driver only shows children
**Symptoms**: Both type driver should show staff and children but only children appear

**Cause**: Current implementation - `getAssignedPassengers` returns staff for 'Work', children for everything else

**Future Fix**: Update logic to fetch both:
```typescript
if (rideType === 'Work') {
  return fetchStaff();
} else if (rideType === 'School') {
  return fetchChildren();
} else if (rideType === 'Both') {
  return [...fetchChildren(), ...fetchStaff()];
}
```

## Expected Backend Logs

### Starting Route for Work Driver:
```
[Driver Route Service] Getting driver ride type for driverId: 123
[Driver Route Service] Driver ride type: Work
[Driver Route Service] Fetching assigned staff for driver
[Driver Route Service] Found 3 staff members assigned
[Driver Route Service] Filtering by attendance...
[Driver Route Service] 3 staff present (no absence filtering for staff yet)
[Driver Route Service] Generating stops for 3 passengers
[Driver Route Service] Created 6 stops (3 pickups + 3 dropoffs)
[VRP Optimizer] Optimizing route for 6 stops...
```

### Completing Stop for Work Driver:
```
[Driver Route Service] Marking stop 45 as completed
[Driver Route Service] Stop belongs to driver 123
[Driver Route Service] Getting driver ride type...
[Driver Route Service] Driver ride type: Work
[Driver Route Service] Creating StaffAttendance record
[Driver Route Service] Staff ID: 5, Date: 2024-01-15, Type: MORNING_PICKUP
[Driver Route Service] Attendance created successfully
```

## Success Criteria

✅ Work drivers can start routes without "no students assigned" error  
✅ Work drivers see staff names in route list  
✅ Staff pickups/dropoffs at correct addresses (home ↔ work)  
✅ StaffAttendance records created (not Attendance)  
✅ School drivers still work normally  
✅ Attendance for children created in Attendance table  
✅ Route optimization works for both types  

## Next: Test in Mobile App

1. Install/update mobile-driver app
2. Login as Work driver
3. Navigate to home → verify staff shown
4. Navigate to Navigation tab
5. Press "Start Morning Route"
6. **CRITICAL CHECK**: Should see staff list, NOT error
7. Complete first stop
8. Check database for StaffAttendance record

If all checks pass: ✅ **Implementation Successful!**
