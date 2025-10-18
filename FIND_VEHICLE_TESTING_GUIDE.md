# Find Vehicle Feature - Quick Testing Guide

## Prerequisites Setup

Before testing the find-vehicle feature, ensure the following data exists in your database:

### 1. Populate Cities Table

```sql
-- Example cities with approximate coordinates
INSERT INTO "City" (name, latitude, longitude) VALUES
('Colombo', 6.9271, 79.8612),
('Nugegoda', 6.8649, 79.8997),
('Maharagama', 6.8484, 79.9267),
('Dehiwala', 6.8532, 79.8713),
('Kottawa', 6.8108, 79.9608),
('Battaramulla', 6.8986, 79.9187),
('Rajagiriya', 6.9089, 79.8912),
('Piliyandala', 6.8018, 79.9218),
('Homagama', 6.8441, 80.0024),
('Malabe', 6.9090, 79.9730);
```

### 2. Add Driver with Route

**IMPORTANT**: Cities must be in the correct travel order!

```sql
-- Example: Add a driver route through multiple cities
-- First, get city IDs
SELECT id, name FROM "City" ORDER BY name;

-- Then insert into DriverCities with cities IN ORDER
-- Example route: Maharagama → Nugegoda → Dehiwala → Colombo
INSERT INTO "DriverCities" ("driverId", "rideType", "cityIds", "usualStartTime", "usualEndTime")
VALUES (1, 'Both', ARRAY[3, 2, 5, 1], '06:00:00', '16:00:00');
-- Assuming: 1=Colombo, 2=Nugegoda, 3=Maharagama, 5=Dehiwala

-- ⚠️ IMPORTANT: The order matters!
-- Correct:   ARRAY[3, 2, 5, 1] means Maharagama→Nugegoda→Dehiwala→Colombo
-- Incorrect: ARRAY[1, 2, 3, 5] would mean Colombo→Nugegoda→Maharagama→Dehiwala
```

**New Algorithm Requirements:**
- Need **at least 2 cities** to form a route
- Cities must be in **actual travel order**
- Algorithm checks **point-to-line distance** to route segments
- Drop-off segment must come **after** pickup segment

### 3. Ensure Customer Has Coordinates

```sql
-- For a child profile
UPDATE "Child" 
SET "pickupLatitude" = 6.8649, 
    "pickupLongitude" = 79.8997,
    "schoolLatitude" = 6.9271,
    "schoolLongitude" = 79.8612
WHERE child_id = 1;

-- For a staff profile
UPDATE "Staff_Passenger"
SET "pickupLatitude" = 6.8649,
    "pickupLongitude" = 79.8997,
    "workLatitude" = 6.9271,
    "workLongitude" = 79.8612
WHERE id = 1;
```

## Backend Testing

### 1. Start Backend Server

```bash
cd backend
npm install
npm run start:dev
```

Wait for the message: `✅ Prisma connected successfully`

### 2. Test Search Endpoint

Using curl:
```bash
curl -X GET "http://localhost:3000/find-vehicle/search?customerId=1&profileType=child&profileId=1"
```

Using Postman:
- Method: GET
- URL: `http://localhost:3000/find-vehicle/search`
- Query Params:
  - customerId: 1
  - profileType: child
  - profileId: 1
  - vehicleType: Van (optional)
  - minRating: 4 (optional)

Expected Response:
```json
[
  {
    "driverId": 1,
    "driverName": "John Doe",
    "driverRating": 4.5,
    "driverPhone": "+94771234567",
    "vehicleId": 1,
    "vehicleType": "Van",
    "vehicleBrand": "Toyota",
    "vehicleModel": "HIACE",
    "vehicleRegistrationNumber": "WP-1234",
    "vehicleColor": "White",
    "availableSeats": 12,
    "airConditioned": true,
    "assistant": false,
    "startCity": "Nugegoda",
    "endCity": "Colombo",
    "routeCities": ["Nugegoda", "Maharagama", "Dehiwala", "Colombo"],
    "distanceFromPickup": 0.5,
    "distanceFromDrop": 2.3,
    "estimatedPickupTime": "06:00",
    "estimatedDropTime": "16:00"
  }
]
```

### 3. Test Profiles Endpoint

```bash
curl -X GET "http://localhost:3000/find-vehicle/profiles?customerId=1"
```

Expected Response:
```json
{
  "children": [
    {
      "child_id": 1,
      "childFirstName": "Jane",
      "childLastName": "Doe",
      "school": "Royal College",
      "pickUpAddress": "123 Main St",
      "pickupLatitude": 6.8649,
      "pickupLongitude": 79.8997,
      "schoolLatitude": 6.9271,
      "schoolLongitude": 79.8612
    }
  ],
  "staff": null
}
```

## Frontend Testing

### 1. Setup Frontend

```bash
cd mobile-customer
npm install
```

### 2. Configure API URL

Create or update `.env` file:
```
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3000
```

Replace `YOUR_IP_ADDRESS` with your computer's local IP (e.g., 192.168.1.100)

### 3. Set Customer Data in AsyncStorage

Add this code temporarily in your login flow or registration flow:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// After successful login/registration
await AsyncStorage.setItem('customerId', '1');
await AsyncStorage.setItem('activeProfileType', 'child');
await AsyncStorage.setItem('activeProfileId', '1');
```

### 4. Run the App

```bash
npx expo start
```

### 5. Navigate to Find Vehicle

1. Open the app on your device/emulator
2. Login if required
3. Navigate to the Find Vehicle screen
4. Observe the loading indicator
5. See the list of available vehicles

### 6. Test Filters

- Change Vehicle Type dropdown (All/Van/Bus)
- Change Minimum Rating (1-5 stars)
- Verify the results update automatically

## Troubleshooting

### No Results Returned

**Check:**
1. Customer coordinates are set in database
2. Driver has DriverCities entry with city IDs
3. Driver status is 'ACTIVE'
4. Driver registrationStatus is 'HAVING_A_PROFILE'
5. Driver has at least one vehicle assigned
6. Cities are within 10km radius

**Debug Query:**
```sql
-- Check if driver route cities are within radius
SELECT 
  d.driver_id,
  d.name,
  dc."cityIds",
  c.name as city_name,
  c.latitude,
  c.longitude
FROM "Driver" d
JOIN "DriverCities" dc ON dc."driverId" = d.driver_id
JOIN "City" c ON c.id = ANY(dc."cityIds")
WHERE d.status = 'ACTIVE';
```

### API Connection Error

**Frontend Error: "Failed to search vehicles"**

Check:
1. Backend is running on port 3000
2. EXPO_PUBLIC_API_URL is correct
3. Mobile device can reach backend IP
4. No firewall blocking the connection

**Test backend reachability:**
```bash
# From your mobile device browser, visit:
http://YOUR_IP:3000/find-vehicle/profiles?customerId=1
```

### Backend Error: "Customer not found"

Ensure:
1. Customer exists in database
2. Customer ID in AsyncStorage is correct
3. Customer has child or staff profile

### Backend Error: "Coordinates are missing"

Update coordinates:
```sql
-- For child
UPDATE "Child" 
SET "pickupLatitude" = 6.8649, 
    "pickupLongitude" = 79.8997,
    "schoolLatitude" = 6.9271,
    "schoolLongitude" = 79.8612
WHERE child_id = YOUR_CHILD_ID;
```

## Sample Test Data Script

Run this to create complete test data:

```sql
-- 1. Create customer
INSERT INTO "Customer" 
("firstName", "lastName", "phone", "registrationStatus") 
VALUES ('Test', 'Customer', '+94771234567', 'HAVING_A_PROFILE')
RETURNING customer_id;

-- Note the customer_id, let's say it's 1

-- 2. Create child for customer
INSERT INTO "Child"
("customerId", "childFirstName", "childLastName", "relationship", "school", "nearbyCity", "schoolLocation", "pickUpAddress", "pickupLatitude", "pickupLongitude", "schoolLatitude", "schoolLongitude")
VALUES (1, 'Test', 'Child', 'Son', 'Royal College', 'Nugegoda', 'Colombo 7', '123 Main St', 6.8649, 79.8997, 6.9271, 79.8612)
RETURNING child_id;

-- 3. Create driver
INSERT INTO "Driver"
("name", "phone", "NIC", "address", "date_of_birth", "gender", "vehicle_Reg_No", "driver_license_front_url", "driver_license_back_url", "nic_front_pic_url", "nice_back_pic_url", "profile_picture_url", "second_phone", "status", "registrationStatus")
VALUES ('Test Driver', '+94771234568', '123456789V', '456 Test St', '1990-01-01', 'Male', 'WP-1234', 'url', 'url', 'url', 'url', 'url', '+94771234569', 'ACTIVE', 'HAVING_A_PROFILE')
RETURNING driver_id;

-- 4. Create vehicle for driver
INSERT INTO "Vehicle"
("driverId", "type", "brand", "model", "manufactureYear", "registrationNumber", "color", "route", "no_of_seats", "air_conditioned", "rear_picture_url", "front_picture_url", "side_picture_url", "inside_picture_url")
VALUES (1, 'Van', 'Toyota', 'HIACE', 2020, 'WP-1234', 'White', ARRAY['Nugegoda', 'Colombo'], 12, true, 'url', 'url', 'url', 'url');

-- 5. Add driver cities (get city IDs first)
SELECT id, name FROM "City" ORDER BY name;

-- Then insert driver route
INSERT INTO "DriverCities"
("driverId", "rideType", "cityIds", "usualStartTime", "usualEndTime")
VALUES (1, 'Both', ARRAY[2, 3, 1], '2024-01-01 06:00:00', '2024-01-01 16:00:00');
-- Assuming: 1=Colombo, 2=Nugegoda, 3=Maharagama
```

## Next Steps

After successful testing:
1. Implement actual driver rating system
2. Add booking/request functionality
3. Integrate push notifications
4. Add map view for routes
5. Implement price estimation
6. Add real-time driver availability

## Support

If you encounter issues:
1. Check backend logs for detailed error messages
2. Use browser dev tools / React Native Debugger
3. Verify database state with SQL queries
4. Check network connectivity between devices
