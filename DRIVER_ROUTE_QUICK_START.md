# Driver Route System - Quick Start Guide

## Prerequisites

1. ✅ Backend is running (`npm run start:dev` in backend folder)
2. ✅ Database is connected (PostgreSQL)
3. ✅ Prisma schema is migrated
4. ✅ Mobile app is running (`npx expo start` in mobile-driver folder)
5. ✅ Google Maps API key is configured in backend `.env`

## Step-by-Step Setup

### 1. Apply Database Migration

```bash
cd backend
npx prisma migrate dev --name add_complete_route_system
npx prisma generate
npm run build  # If using production
```

### 2. Verify Environment Variables

Check `backend/.env`:

```
DATABASE_URL="your_database_url"
GOOGLE_MAPS_API_KEY="your_google_maps_key"
```

### 3. Ensure Test Data Exists

You need:

- At least 1 Driver with valid credentials
- At least 3-5 Children assigned to that driver
- Children must have valid coordinates:
  - `pickupLatitude` and `pickupLongitude` (home location)
  - `schoolLatitude` and `schoolLongitude` (school location)
- ChildRideRequest records linking driver to children with `status='Assigned'`

### 4. Start the Backend

```bash
cd backend
npm run start:dev
```

Verify it's running: `http://localhost:3000`

### 5. Start the Mobile App

```bash
cd mobile-driver
npx expo start
```

Press `a` for Android or `i` for iOS.

## Testing the Complete Workflow

### Test 1: Login and View Home Screen

1. Open mobile app
2. Login with driver credentials
3. You should see:
   - Welcome message with driver name
   - "Setup Route" card OR "Current Trip" card (if route already set up)
   - Assigned Students summary
   - Today's Schedule
   - Quick Actions

**Expected Result**: ✅ Driver sees their profile and assigned students count

---

### Test 2: Mark Student Attendance

1. On home screen, scroll to "Quick Actions"
2. Tap "Mark Attendance"
3. You should see list of all assigned students
4. Tap on a student to toggle absent/present
5. Notice the student row turns red when marked absent
6. Tap "Save Attendance"

**Expected Result**: ✅ Attendance saved successfully, toast message appears

**Backend Check**:

```sql
SELECT * FROM "Absence_Child"
WHERE date = CURRENT_DATE
ORDER BY "createdAt" DESC;
```

---

### Test 3: Generate Today's Route

1. Return to home screen
2. Tap "Start Trip" button
3. App navigates to Navigation tab
4. Tap "Start Ride" button
5. App requests location permission → grant it
6. Wait 3-5 seconds for route generation

**Expected Result**: ✅ Route is generated and first stop appears

**What happens behind the scenes**:

- App gets your current GPS location
- Backend fetches assigned children
- Backend filters out absent students
- Backend calls Google Maps Distance Matrix API
- Backend optimizes route order (pickup → pickup → ... → dropoff at school)
- Backend saves route to `DriverRoute` and `RouteStop` tables
- App displays first stop

**Backend Check**:

```sql
-- Check if route was created
SELECT * FROM "DriverRoute"
WHERE date = CURRENT_DATE
ORDER BY "createdAt" DESC
LIMIT 1;

-- Check stops
SELECT * FROM "RouteStop"
WHERE "driverRouteId" = (
  SELECT id FROM "DriverRoute"
  WHERE date = CURRENT_DATE
  LIMIT 1
)
ORDER BY "order";
```

---

### Test 4: Navigate to First Stop

1. You should see "Current Stop Card" with:

   - Student name
   - Address
   - ETA
   - Distance
   - "Get Directions" button
   - "Mark as Picked Up" button

2. Tap "Get Directions"
3. Google Maps opens with navigation to the stop location

**Expected Result**: ✅ Google Maps opens with destination set

---

### Test 5: Complete First Stop

1. (In testing, you don't need to actually drive there)
2. Return to your app
3. Tap "Mark as Picked Up"
4. Wait for success message

**Expected Result**:

- ✅ Success alert: "Pickup completed! Moving to next stop."
- ✅ App automatically shows the NEXT stop
- ✅ Progress bar updates
- ✅ "Next Stop Preview" card updates

**Backend Check**:

```sql
-- Check stop status updated
SELECT * FROM "RouteStop"
WHERE "driverRouteId" = (
  SELECT id FROM "DriverRoute" WHERE date = CURRENT_DATE LIMIT 1
)
ORDER BY "order";

-- Check attendance record created
SELECT * FROM "Attendance"
WHERE date = CURRENT_DATE
ORDER BY timestamp DESC
LIMIT 1;
```

---

### Test 6: Complete All Remaining Stops

1. For each remaining stop:

   - Tap "Get Directions" (optional)
   - Tap "Mark as Picked Up" or "Mark as Dropped Off"
   - Verify next stop appears

2. After marking the LAST stop complete:

**Expected Result**:

- ✅ Alert: "Ride Complete! All stops have been completed."
- ✅ Screen shows "All Stops Completed!" message
- ✅ Route status changes to 'COMPLETED'

**Backend Check**:

```sql
SELECT status FROM "DriverRoute"
WHERE date = CURRENT_DATE
ORDER BY "createdAt" DESC
LIMIT 1;
-- Should return 'COMPLETED'
```

---

### Test 7: Check Attendance Records

```sql
-- View all attendance records for today
SELECT
  a.id,
  a.type,
  c."childFirstName",
  c."childLastName",
  a.timestamp,
  a.status
FROM "Attendance" a
JOIN "Child" c ON c.child_id = a."childId"
WHERE a.date = CURRENT_DATE
ORDER BY a.timestamp;
```

**Expected Result**: ✅ One pickup record and one dropoff record for each student

---

## Common Issues and Solutions

### Issue: "No students assigned"

**Cause**: No ChildRideRequest records with status='Assigned'

**Fix**:

```sql
-- Check assigned students
SELECT * FROM "ChildRideRequest"
WHERE "driverId" = YOUR_DRIVER_ID
AND status = 'Assigned';

-- If empty, create test assignments
INSERT INTO "ChildRideRequest" ("childId", "driverId", status, "createdAt", "updatedAt")
VALUES
  (1, YOUR_DRIVER_ID, 'Assigned', NOW(), NOW()),
  (2, YOUR_DRIVER_ID, 'Assigned', NOW(), NOW()),
  (3, YOUR_DRIVER_ID, 'Assigned', NOW(), NOW());
```

---

### Issue: "No valid pickup/dropoff locations"

**Cause**: Child records missing coordinates

**Fix**:

```sql
-- Check children coordinates
SELECT
  child_id,
  "childFirstName",
  "pickupLatitude",
  "pickupLongitude",
  "schoolLatitude",
  "schoolLongitude"
FROM "Child"
WHERE child_id IN (
  SELECT "childId" FROM "ChildRideRequest"
  WHERE "driverId" = YOUR_DRIVER_ID
);

-- Update missing coordinates (example Colombo area)
UPDATE "Child"
SET
  "pickupLatitude" = 6.9271 + (RANDOM() * 0.1),
  "pickupLongitude" = 79.8612 + (RANDOM() * 0.1),
  "schoolLatitude" = 6.9271,
  "schoolLongitude" = 79.8612
WHERE "pickupLatitude" IS NULL;
```

---

### Issue: Route optimization fails

**Symptoms**: Error message about route generation

**Checks**:

1. Is `GOOGLE_MAPS_API_KEY` set in backend `.env`?
2. Is the API key valid and has correct permissions?
3. Is Distance Matrix API enabled in Google Cloud Console?
4. Check backend logs for API errors

**Fallback**: System will use default order if Google Maps fails

---

### Issue: "Failed to mark stop completed"

**Checks**:

1. Is JWT token still valid? (Re-login if expired)
2. Is backend running?
3. Check network connectivity
4. Check backend logs

---

## API Endpoints Reference

### Get Today's Route

```
POST /driver/route/today
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "routeType": "MORNING_PICKUP",
  "latitude": 6.9271,
  "longitude": 79.8612
}
```

### Mark Stop Complete

```
PATCH /driver/route/stop/:stopId/complete
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "latitude": 6.9271,
  "longitude": 79.8612,
  "notes": "Pickup completed"
}
```

### Get Route Status

```
GET /driver/route/status
Authorization: Bearer <jwt_token>
```

---

## Quick Database Queries for Debugging

### View today's route

```sql
SELECT
  dr.id,
  dr."routeType",
  dr.status,
  dr."totalDistanceMeters",
  COUNT(rs.id) as stop_count,
  COUNT(CASE WHEN rs.status = 'COMPLETED' THEN 1 END) as completed_count
FROM "DriverRoute" dr
LEFT JOIN "RouteStop" rs ON rs."driverRouteId" = dr.id
WHERE dr.date = CURRENT_DATE
AND dr."driverId" = YOUR_DRIVER_ID
GROUP BY dr.id;
```

### View all stops for today's route

```sql
SELECT
  rs."order",
  rs.type,
  c."childFirstName" || ' ' || c."childLastName" as student_name,
  rs.address,
  rs.status,
  rs."legDistanceMeters"
FROM "RouteStop" rs
JOIN "Child" c ON c.child_id = rs."childId"
WHERE rs."driverRouteId" = (
  SELECT id FROM "DriverRoute"
  WHERE date = CURRENT_DATE
  AND "driverId" = YOUR_DRIVER_ID
  LIMIT 1
)
ORDER BY rs."order";
```

### Clear today's data (for re-testing)

```sql
-- Delete attendance
DELETE FROM "Attendance" WHERE date = CURRENT_DATE;

-- Delete route stops
DELETE FROM "RouteStop"
WHERE "driverRouteId" IN (
  SELECT id FROM "DriverRoute" WHERE date = CURRENT_DATE
);

-- Delete routes
DELETE FROM "DriverRoute" WHERE date = CURRENT_DATE;

-- Delete absences
DELETE FROM "Absence_Child" WHERE date = CURRENT_DATE;
```

---

## Success Criteria ✅

After completing all tests, you should have:

- [x] Driver can login and see home screen
- [x] Driver can mark students as absent/present
- [x] Driver can start a ride and get optimized route
- [x] Route only includes present students
- [x] Route is ordered logically (pickups → dropoffs)
- [x] Driver can navigate to each stop with Google Maps
- [x] Driver can mark each stop as complete
- [x] App advances through stops sequentially
- [x] Attendance records are created for each stop
- [x] Route is marked complete after last stop
- [x] All data is persisted in database

---

## Next Steps

1. **Test with real data**: Use actual student addresses in your area
2. **Test edge cases**:
   - All students absent
   - Only one student present
   - Route with 10+ students
3. **Test afternoon dropoff**: Change routeType to 'AFTERNOON_DROPOFF'
4. **Add more features**:
   - Parent notifications
   - Real-time location sharing
   - Route history/replay

---

## Support

If you encounter any issues not covered here:

1. Check backend logs: `backend/logs` or console output
2. Check mobile app logs: Expo console
3. Check database state: Use SQL queries above
4. Review `DRIVER_ROUTE_IMPLEMENTATION_COMPLETE.md` for detailed architecture

---

**Congratulations!** 🎉 You now have a fully functional, production-ready driver routing system with attendance-based optimization!
