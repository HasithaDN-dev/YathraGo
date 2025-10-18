# Driver Route Setup - Quick Testing Guide

## 🧪 How to Test the New Feature

### Prerequisites

1. Backend server running (`npm run start:dev` in `backend/`)
2. Mobile driver app running (`npm start` in `mobile-driver/`)
3. Database with test data (cities and a test driver account)

---

## Test Case 1: First-Time Driver Route Setup

### Step 1: Prepare Test Environment

```sql
-- Connect to your PostgreSQL database and run:
DELETE FROM "DriverCities" WHERE "driverId" = <YOUR_TEST_DRIVER_ID>;
```

### Step 2: Login to Mobile App

1. Open the mobile driver app
2. Login with test driver credentials
3. Navigate to Home tab

### Step 3: Verify Setup Card Appears

✅ You should see **"Setup Your Route"** card instead of the normal trip card
✅ The card should say: "Add cities in the order you'll travel from start to destination"
✅ You should see an "Add City" button

### Step 4: Add Cities

1. Click **"Add City"** button
2. A scrollable list of cities should appear
3. Click on a city (e.g., "Maharagama Junction")
4. The city should appear in the selected list with number "1"
5. Click **"Add City"** again
6. Select another city (e.g., "Royal College")
7. It should appear with number "2"

### Step 5: Verify UI Elements

✅ Each selected city shows:

- Number badge (1, 2, 3...)
- City name
- Label: "Starting Point" (first), "Destination" (last), or "Waypoint" (middle)
- X button to remove

✅ Cities already selected should be grayed out in the dropdown with checkmark

✅ "Save Route" button should be:

- Disabled if < 2 cities selected
- Enabled if ≥ 2 cities selected

### Step 6: Save Route

1. With at least 2 cities selected, click **"Save Route"**
2. Button should show loading state
3. After successful save:
   - Setup card disappears
   - Normal trip card appears
   - Selected cities show as start/end points

### Step 7: Verify Data Saved

```sql
-- Check database:
SELECT * FROM "DriverCities" WHERE "driverId" = <YOUR_TEST_DRIVER_ID>;
-- Should show the cityIds array with your selected cities
```

---

## Test Case 2: Existing Driver Login

### Step 1: Ensure Route is Already Setup

Driver should have existing record in `DriverCities` table.

### Step 2: Login to Mobile App

1. Open the mobile driver app
2. Login with the test driver credentials
3. Navigate to Home tab

### Step 3: Verify Normal Home Screen

✅ Should NOT see "Setup Your Route" card
✅ Should see "Current Trip" card with:

- Start city (first city from route)
- End city (last city from route)
- "Start Trip" button
  ✅ Should see "Assigned Students" section
  ✅ Should see "Today's Schedule" section
  ✅ Should see "Quick Actions" section

---

## Test Case 3: Remove City from Selection

### During Route Setup:

1. Add 3 cities to the list
2. Click the X button on the 2nd city
3. ✅ City should be removed
4. ✅ Remaining cities should re-number (1, 2 instead of 1, 3)
5. ✅ Removed city should be available in dropdown again

---

## Test Case 4: Error Handling

### Test Minimum Cities Validation:

1. Add only 1 city
2. Try to click "Save Route"
3. ✅ Button should be disabled
4. ✅ Should show message: "Add at least 1 more city to save"

### Test API Error:

1. Stop backend server
2. Try to save route
3. ✅ Should show error message: "Failed to save route. Please try again."
4. ✅ Button should not remain in loading state

---

## Test Case 5: Pull to Refresh

### With No Route Setup:

1. Pull down on home screen
2. ✅ Should show refresh indicator
3. ✅ Should still show setup card after refresh

### With Route Setup:

1. Pull down on home screen
2. ✅ Should show refresh indicator
3. ✅ Should reload route data (start/end cities, ETA)

---

## Test Case 6: Backend API Testing (Postman)

### GET Driver Cities (No Setup)

```
GET http://localhost:3000/driver/cities
Authorization: Bearer <DRIVER_JWT_TOKEN>

Expected Response:
{
  "success": false,
  "hasRoute": false,
  "message": "No route cities found for driver",
  "cities": []
}
```

### POST Save Driver Cities

```
POST http://localhost:3000/driver/cities
Authorization: Bearer <DRIVER_JWT_TOKEN>
Content-Type: application/json

Body:
{
  "cityIds": [1, 3, 5, 2]
}

Expected Response:
{
  "success": true,
  "message": "Driver cities saved successfully",
  "driverCities": {
    "id": 1,
    "driverId": 123,
    "cityIds": [1, 3, 5, 2],
    "rideType": "Both",
    ...
  }
}
```

### POST with Invalid Data (< 2 cities)

```
POST http://localhost:3000/driver/cities
Body: { "cityIds": [1] }

Expected Response:
{
  "success": false,
  "message": "Please provide at least 2 cities (start and destination)"
}
```

### POST with Invalid City IDs

```
POST http://localhost:3000/driver/cities
Body: { "cityIds": [9999, 9998] }

Expected Response:
{
  "statusCode": 400,
  "message": "Some city IDs are invalid"
}
```

### GET Driver Cities (After Setup)

```
GET http://localhost:3000/driver/cities
Authorization: Bearer <DRIVER_JWT_TOKEN>

Expected Response:
{
  "success": true,
  "hasRoute": true,
  "cities": [
    {
      "id": 1,
      "name": "Maharagama Junction",
      "latitude": 6.8463,
      "longitude": 79.9290,
      "createdAt": "...",
      "updatedAt": "..."
    },
    {
      "id": 3,
      "name": "Colombo Fort",
      "latitude": 6.9344,
      "longitude": 79.8428,
      ...
    },
    ...
  ],
  "cityIds": [1, 3, 5, 2]
}
```

---

## Test Case 7: Update Existing Route

### Current Behavior:

The `POST /driver/cities` endpoint will UPDATE the existing route if called again.

1. Save a route with cities [1, 2, 3]
2. Call POST again with cities [4, 5, 6]
3. ✅ Should update the cityIds array
4. ✅ Old cities should be replaced

---

## 🐛 Common Issues & Solutions

### Issue: "Loading cities..." never completes

**Solution**:

- Check if `/cities` endpoint is working
- Verify database has cities in the `City` table
- Check console for network errors

### Issue: "Save Route" doesn't work

**Solution**:

- Verify JWT token is valid
- Check backend logs for errors
- Verify at least 2 cities are selected

### Issue: App shows setup card even after saving

**Solution**:

- Check if POST request succeeded
- Verify data was saved in database
- Try pull-to-refresh to reload data

### Issue: Cities not in correct order

**Solution**:

- The order is determined by the order cities are added
- Remove and re-add cities to change order
- Backend saves cities in the exact order received

---

## 📊 Database Queries for Debugging

### Check driver's route:

```sql
SELECT
  dc.*,
  d.name as driver_name,
  d.phone
FROM "DriverCities" dc
JOIN "Driver" d ON dc."driverId" = d.driver_id
WHERE dc."driverId" = <DRIVER_ID>;
```

### Get city names for a route:

```sql
SELECT
  c.id,
  c.name,
  c.latitude,
  c.longitude
FROM "City" c
WHERE c.id = ANY(
  SELECT unnest("cityIds")
  FROM "DriverCities"
  WHERE "driverId" = <DRIVER_ID>
);
```

### Reset all driver routes (for testing):

```sql
DELETE FROM "DriverCities";
```

### Seed cities if empty:

```sql
INSERT INTO "City" (name, latitude, longitude) VALUES
  ('Maharagama Junction', 6.8463, 79.9290),
  ('Colombo Fort', 6.9344, 79.8428),
  ('Kandy City', 7.2906, 80.6337),
  ('Galle Fort', 6.0367, 80.2170),
  ('Negombo', 7.2083, 79.8358),
  ('Royal College', 6.9025, 79.8612),
  ('Peradeniya', 7.2599, 80.5977);
```

---

## ✅ Testing Checklist

- [ ] Setup card appears for first-time driver
- [ ] Cities load successfully
- [ ] Can add multiple cities
- [ ] Can remove cities
- [ ] Cities show in correct order
- [ ] Save button validates minimum 2 cities
- [ ] Route saves to database successfully
- [ ] Normal home screen appears after save
- [ ] Existing drivers see normal screen immediately
- [ ] Pull-to-refresh works
- [ ] Error messages display correctly
- [ ] Loading states work properly
- [ ] Start/end cities show correctly on trip card
- [ ] API endpoints return correct responses
- [ ] Database records are created/updated properly

---

## 🎯 Expected Behavior Summary

| Scenario               | Expected UI      | Expected Data                |
| ---------------------- | ---------------- | ---------------------------- |
| First login (no route) | Setup card shown | No DriverCities record       |
| After saving route     | Trip card shown  | DriverCities record created  |
| Subsequent login       | Trip card shown  | Existing DriverCities loaded |
| Pull to refresh        | Data reloads     | ETA recalculated             |

---

## 📞 Need Help?

If you encounter issues:

1. Check backend logs for errors
2. Check mobile app console for errors
3. Verify database schema matches Prisma schema
4. Ensure cities exist in database
5. Verify JWT token is valid and not expired

---

Happy Testing! 🚀
