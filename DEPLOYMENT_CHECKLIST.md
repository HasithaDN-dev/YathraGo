# Driver Routing System - Deployment Checklist

## Pre-Deployment Checklist

### 1. Database Migration ✓

```bash
cd backend
npx prisma migrate dev --name add_complete_route_system
npx prisma generate
```

**Verify:**

- [ ] Migration completed without errors
- [ ] New tables visible in database: `RouteStop`
- [ ] `DriverRoute` table has new columns
- [ ] `Attendance` table has unique constraint

**SQL Check:**

```sql
-- Verify RouteStop table exists
SELECT * FROM "RouteStop" LIMIT 1;

-- Verify DriverRoute has new columns
SELECT "routeType", status, "totalDistanceMeters" FROM "DriverRoute" LIMIT 1;

-- Verify Attendance has unique constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'Attendance';
```

---

### 2. Environment Variables ✓

**Backend `.env`:**

```bash
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/yathrago"
GOOGLE_MAPS_API_KEY="your_actual_api_key_here"
JWT_SECRET="your_jwt_secret"

# Optional but recommended
NODE_ENV="production"
PORT=3000
```

**Verify:**

- [ ] `GOOGLE_MAPS_API_KEY` is set
- [ ] Google Maps API key is valid
- [ ] Distance Matrix API is enabled in Google Cloud Console
- [ ] Directions API is enabled in Google Cloud Console
- [ ] Billing is set up (required for Google Maps APIs)

**Test API Key:**

```bash
curl "https://maps.googleapis.com/maps/api/distancematrix/json?origins=6.9271,79.8612&destinations=6.9271,79.8612&key=YOUR_API_KEY"
```

Expected response: `"status" : "OK"`

---

### 3. Backend Build & Start ✓

```bash
cd backend
npm install
npm run build
npm run start:prod
```

**Verify:**

- [ ] Backend starts without errors
- [ ] Server is accessible at `http://localhost:3000`
- [ ] Health check endpoint works
- [ ] No TypeScript compilation errors

**Test Endpoint:**

```bash
curl http://localhost:3000
```

---

### 4. Mobile App Configuration ✓

**Update `mobile-driver/config/api.ts`:**

```typescript
// For development
export const API_BASE_URL = "http://192.168.x.x:3000";

// For production
export const API_BASE_URL = "https://api.yourapp.com";
```

**Verify:**

- [ ] API_BASE_URL points to correct backend
- [ ] Can reach backend from mobile device/emulator

**Test from mobile:**

```bash
# From mobile terminal/Expo console
curl http://YOUR_BACKEND_URL
```

---

### 5. Test Data Setup ✓

**Required data in database:**

```sql
-- 1. Driver with credentials
SELECT * FROM "Driver" WHERE phone = 'YOUR_TEST_DRIVER_PHONE';

-- 2. Children with valid coordinates
SELECT
  child_id,
  "childFirstName",
  "pickupLatitude",
  "pickupLongitude",
  "schoolLatitude",
  "schoolLongitude"
FROM "Child"
WHERE "pickupLatitude" IS NOT NULL
  AND "schoolLatitude" IS NOT NULL;

-- 3. Assigned ride requests
SELECT * FROM "ChildRideRequest"
WHERE "driverId" = YOUR_DRIVER_ID
  AND status = 'Assigned';
```

**If missing data, create test data:**

```sql
-- Example: Assign children to driver
INSERT INTO "ChildRideRequest" ("childId", "driverId", status, "createdAt", "updatedAt")
VALUES
  (1, YOUR_DRIVER_ID, 'Assigned', NOW(), NOW()),
  (2, YOUR_DRIVER_ID, 'Assigned', NOW(), NOW()),
  (3, YOUR_DRIVER_ID, 'Assigned', NOW(), NOW());

-- Example: Add coordinates to children (Colombo area)
UPDATE "Child"
SET
  "pickupLatitude" = 6.9271 + (RANDOM() * 0.05 - 0.025),
  "pickupLongitude" = 79.8612 + (RANDOM() * 0.05 - 0.025),
  "schoolLatitude" = 6.9271,
  "schoolLongitude" = 79.8612
WHERE child_id IN (1, 2, 3);
```

**Verify:**

- [ ] At least 1 driver exists
- [ ] Driver has at least 3 assigned children
- [ ] Children have valid coordinates (not null)
- [ ] Coordinates are realistic (Sri Lanka: lat ~6-10, lng ~79-82)

---

### 6. API Testing ✓

**Test with Postman or curl:**

#### Login and Get Token

```bash
POST http://localhost:3000/auth/driver/login
Content-Type: application/json

{
  "phone": "+94771234567",
  "code": "123456"
}
```

Save the JWT token from response.

#### Get Today's Route

```bash
POST http://localhost:3000/driver/route/today
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "routeType": "MORNING_PICKUP",
  "latitude": 6.9271,
  "longitude": 79.8612
}
```

Expected: Route with stops array

#### Mark Stop Complete

```bash
PATCH http://localhost:3000/driver/route/stop/1/complete
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "latitude": 6.9271,
  "longitude": 79.8612,
  "notes": "Test completion"
}
```

Expected: `{"success": true, "remainingStops": X}`

**Verify:**

- [ ] All endpoints return expected responses
- [ ] JWT authentication works
- [ ] Route generation works
- [ ] Stop completion works

---

### 7. Mobile App Testing ✓

**Start mobile app:**

```bash
cd mobile-driver
npm install
npx expo start --clear
```

**Manual Test Flow:**

1. **Login**

   - [ ] Can login with driver credentials
   - [ ] Redirects to home screen
   - [ ] Shows driver name and profile

2. **View Home**

   - [ ] Shows assigned students count
   - [ ] Shows "Start Trip" button
   - [ ] Shows "Mark Attendance" in Quick Actions

3. **Mark Attendance**

   - [ ] Tap "Mark Attendance"
   - [ ] See list of assigned students
   - [ ] Can toggle absent/present
   - [ ] Can save attendance

4. **Start Ride**

   - [ ] Tap "Start Trip"
   - [ ] Navigate to Navigation tab
   - [ ] Tap "Start Ride"
   - [ ] Route loads (3-5 seconds)
   - [ ] First stop displays

5. **Navigate Stop**

   - [ ] See current stop details
   - [ ] Tap "Get Directions"
   - [ ] Google Maps opens
   - [ ] Can return to app

6. **Complete Stop**

   - [ ] Tap "Mark as Picked Up"
   - [ ] Success message appears
   - [ ] Next stop displays
   - [ ] Progress updates

7. **Complete Route**
   - [ ] Complete all stops
   - [ ] "Ride Complete" message
   - [ ] Can start new ride

---

### 8. Database Verification ✓

After completing a test ride:

```sql
-- Check route was created
SELECT * FROM "DriverRoute"
WHERE date = CURRENT_DATE
ORDER BY "createdAt" DESC;

-- Check stops
SELECT
  rs."order",
  rs.type,
  rs.status,
  c."childFirstName"
FROM "RouteStop" rs
JOIN "Child" c ON c.child_id = rs."childId"
WHERE rs."driverRouteId" = (SELECT id FROM "DriverRoute" WHERE date = CURRENT_DATE LIMIT 1)
ORDER BY rs."order";

-- Check attendance records
SELECT
  a.type,
  a.status,
  c."childFirstName",
  a.timestamp
FROM "Attendance" a
JOIN "Child" c ON c.child_id = a."childId"
WHERE a.date = CURRENT_DATE
ORDER BY a.timestamp;
```

**Verify:**

- [ ] DriverRoute record exists with correct status
- [ ] RouteStop records exist in correct order
- [ ] All stops marked as COMPLETED
- [ ] Attendance records exist for each stop
- [ ] Timestamps are correct

---

## Performance Checks

### Backend Performance ✓

```bash
# Check response times
time curl -X POST http://localhost:3000/driver/route/today \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"routeType":"MORNING_PICKUP","latitude":6.9271,"longitude":79.8612}'
```

**Targets:**

- [ ] Route generation: < 5 seconds for 10 students
- [ ] Stop completion: < 1 second
- [ ] API endpoints: < 500ms (excluding route generation)

### Database Performance ✓

```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM "DriverRoute"
WHERE "driverId" = YOUR_ID
  AND date = CURRENT_DATE;
```

**Verify:**

- [ ] Indexes are being used
- [ ] Query times are reasonable (< 100ms)

---

## Production Deployment

### Option 1: Docker Deployment

```bash
# Backend Dockerfile
cd backend
docker build -t yathrago-backend .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e GOOGLE_MAPS_API_KEY="..." \
  yathrago-backend
```

### Option 2: Cloud Platform (Heroku, AWS, etc.)

**Heroku Example:**

```bash
cd backend
heroku create yathrago-api
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set GOOGLE_MAPS_API_KEY=your_key
git push heroku main
heroku run npx prisma migrate deploy
```

### Mobile App Build

**For Android:**

```bash
cd mobile-driver
eas build --platform android
```

**For iOS:**

```bash
cd mobile-driver
eas build --platform ios
```

---

## Post-Deployment Verification

- [ ] Backend is accessible from internet
- [ ] Mobile app can connect to backend
- [ ] All API endpoints work
- [ ] Can complete full workflow
- [ ] Data persists correctly
- [ ] No error logs in production

---

## Monitoring Setup (Recommended)

1. **Backend Logs**

   - Set up log aggregation (e.g., Loggly, Papertrail)
   - Monitor error rates
   - Set up alerts for failures

2. **Database**

   - Set up backup schedule
   - Monitor query performance
   - Set up alerts for high usage

3. **API Monitoring**

   - Set up uptime monitoring (e.g., UptimeRobot)
   - Monitor response times
   - Set up alerts for downtime

4. **Google Maps API**
   - Monitor quota usage
   - Set up billing alerts
   - Track costs

---

## Rollback Plan

If something goes wrong:

```bash
# 1. Rollback database migration
cd backend
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# 2. Revert code changes
git revert HEAD

# 3. Restart services
npm run start:prod

# 4. Clear mobile app cache
npx expo start --clear
```

---

## Success Criteria

System is ready for production when:

- [x] All database migrations successful
- [x] Backend starts without errors
- [x] Mobile app connects to backend
- [x] Can login as driver
- [x] Can mark attendance
- [x] Can generate route
- [x] Can navigate stops
- [x] Can complete stops
- [x] Data persists correctly
- [x] No critical errors in logs
- [x] Performance meets targets
- [x] Google Maps integration works
- [x] Full workflow tested end-to-end

---

## Emergency Contacts

- **Backend Developer**: [Your contact]
- **Mobile Developer**: [Your contact]
- **Database Admin**: [Your contact]
- **DevOps**: [Your contact]

---

## Additional Resources

- Technical Documentation: `DRIVER_ROUTE_IMPLEMENTATION_COMPLETE.md`
- Testing Guide: `DRIVER_ROUTE_QUICK_START.md`
- Implementation Summary: `IMPLEMENTATION_SUMMARY_FINAL.md`

---

**Good luck with deployment! 🚀**
