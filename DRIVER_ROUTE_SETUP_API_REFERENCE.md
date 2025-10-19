# Driver Route Setup - API Quick Reference

## 📡 New API Endpoints

### 1. Get Driver Cities

**Endpoint**: `GET /driver/cities`  
**Authentication**: Required (JWT)  
**Description**: Check if driver has a route setup and retrieve assigned cities

#### Request

```http
GET http://localhost:3000/driver/cities
Authorization: Bearer <JWT_TOKEN>
```

#### Success Response (Route Exists)

```json
{
  "success": true,
  "hasRoute": true,
  "cities": [
    {
      "id": 1,
      "name": "Maharagama Junction",
      "latitude": 6.8463,
      "longitude": 79.929,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": 3,
      "name": "Colombo Fort",
      "latitude": 6.9344,
      "longitude": 79.8428,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "cityIds": [1, 3]
}
```

#### Success Response (No Route)

```json
{
  "success": false,
  "hasRoute": false,
  "message": "No route cities found for driver",
  "cities": []
}
```

#### Error Response (Unauthorized)

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### 2. Save/Update Driver Cities

**Endpoint**: `POST /driver/cities`  
**Authentication**: Required (JWT)  
**Description**: Save or update driver's route cities (minimum 2 cities required)

#### Request

```http
POST http://localhost:3000/driver/cities
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "cityIds": [1, 3, 5, 2]
}
```

#### Request Body Schema

```typescript
{
  cityIds: number[]  // Array of city IDs in travel order (min 2)
}
```

#### Success Response (Created)

```json
{
  "success": true,
  "message": "Driver cities saved successfully",
  "driverCities": {
    "id": 1,
    "driverId": 123,
    "cityIds": [1, 3, 5, 2],
    "rideType": "Both",
    "usualEndTime": null,
    "usualStartTime": null
  }
}
```

#### Success Response (Updated)

```json
{
  "success": true,
  "message": "Driver cities updated successfully",
  "driverCities": {
    "id": 1,
    "driverId": 123,
    "cityIds": [1, 3, 5, 2],
    "rideType": "Both",
    "usualEndTime": null,
    "usualStartTime": null
  }
}
```

#### Error Response (Validation - Too Few Cities)

```json
{
  "success": false,
  "message": "Please provide at least 2 cities (start and destination)"
}
```

#### Error Response (Invalid City IDs)

```json
{
  "statusCode": 400,
  "message": "Some city IDs are invalid"
}
```

#### Error Response (Unauthorized)

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 🗺️ Existing Endpoints (Used by Feature)

### 3. Get All Cities

**Endpoint**: `GET /cities`  
**Authentication**: Not required  
**Description**: Retrieve all available cities

#### Request

```http
GET http://localhost:3000/cities
```

#### Optional Query Parameters

```
?q=search_term  // Filter cities by name (case-insensitive)
```

#### Success Response

```json
[
  {
    "id": 1,
    "name": "Maharagama Junction",
    "latitude": 6.8463,
    "longitude": 79.929
  },
  {
    "id": 2,
    "name": "Royal College",
    "latitude": 6.9025,
    "longitude": 79.8612
  },
  {
    "id": 3,
    "name": "Colombo Fort",
    "latitude": 6.9344,
    "longitude": 79.8428
  }
]
```

---

### 4. Get Driver Route Cities (Start/End Only)

**Endpoint**: `GET /driver/route-cities`  
**Authentication**: Required (JWT)  
**Description**: Get driver's route start and end points with coordinates

#### Request

```http
GET http://localhost:3000/driver/route-cities
Authorization: Bearer <JWT_TOKEN>
```

#### Success Response

```json
{
  "success": true,
  "startPoint": "Maharagama Junction",
  "endPoint": "Royal College",
  "startCityId": 1,
  "endCityId": 2,
  "startLatitude": 6.8463,
  "startLongitude": 79.929,
  "endLatitude": 6.9025,
  "endLongitude": 79.8612
}
```

#### Error Response (No Route)

```json
{
  "success": false,
  "message": "No route cities found for driver"
}
```

---

### 5. Get Driver Route Cities with ETA

**Endpoint**: `GET /driver/route-cities-with-eta`  
**Authentication**: Required (JWT)  
**Description**: Get driver's route with calculated ETA and distance

#### Request

```http
GET http://localhost:3000/driver/route-cities-with-eta
Authorization: Bearer <JWT_TOKEN>
```

#### Success Response

```json
{
  "success": true,
  "startPoint": "Maharagama Junction",
  "endPoint": "Royal College",
  "startCityId": 1,
  "endCityId": 2,
  "startLatitude": 6.8463,
  "startLongitude": 79.929,
  "endLatitude": 6.9025,
  "endLongitude": 79.8612,
  "etaMinutes": 35,
  "distanceKm": 12.5
}
```

---

## 🔐 Authentication

All driver endpoints require JWT authentication:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The JWT token contains:

```typescript
{
  sub: string,        // Driver ID
  phone: string,      // Driver phone number
  userType: "DRIVER",
  isVerified: boolean
}
```

---

## 🎯 Usage Flow

### First-Time Driver Setup

```
1. Login → Get JWT token
2. GET /driver/cities → Check if route exists
3. If hasRoute = false:
   a. GET /cities → Fetch available cities
   b. User selects cities in order
   c. POST /driver/cities → Save route
4. If hasRoute = true:
   a. GET /driver/route-cities-with-eta → Get route details
```

### Existing Driver

```
1. Login → Get JWT token
2. GET /driver/cities → Check if route exists
3. If hasRoute = true:
   a. GET /driver/route-cities-with-eta → Get route with ETA
   b. Display normal home screen
```

---

## 📝 Important Notes

1. **Driver ID**: Automatically extracted from JWT token (no need to pass in request)
2. **City Order**: The order of city IDs in the array determines the route order
3. **Minimum Cities**: At least 2 cities required (start and destination)
4. **Update Route**: Calling POST again will update existing route
5. **City Validation**: All city IDs must exist in the database

---

## 🧪 Postman Collection

### Example Environment Variables

```
base_url: http://localhost:3000
driver_token: <YOUR_JWT_TOKEN>
```

### Example Requests

**1. Get Cities**

```
Method: GET
URL: {{base_url}}/cities
```

**2. Check Driver Route**

```
Method: GET
URL: {{base_url}}/driver/cities
Headers:
  Authorization: Bearer {{driver_token}}
```

**3. Save Driver Route**

```
Method: POST
URL: {{base_url}}/driver/cities
Headers:
  Authorization: Bearer {{driver_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "cityIds": [1, 3, 5, 2]
}
```

**4. Get Route with ETA**

```
Method: GET
URL: {{base_url}}/driver/route-cities-with-eta
Headers:
  Authorization: Bearer {{driver_token}}
```

---

## ⚡ Performance Considerations

- **Caching**: ETA data is cached on frontend to reduce API calls
- **Validation**: City validation happens on backend to ensure data integrity
- **Batch Operations**: Route is saved as a single transaction
- **Query Optimization**: Uses indexed queries for fast lookups

---

## 🔄 Database Schema Reference

### DriverCities Table

```prisma
model DriverCities {
  id             Int       @id @default(autoincrement())
  driverId       Int       @unique
  cityIds        Int[]     // PostgreSQL integer array
  rideType       Ridetype  @default(Both)
  usualEndTime   DateTime? @db.Time(6)
  usualStartTime DateTime? @db.Time(6)
  driver         Driver    @relation(fields: [driverId], references: [driver_id])
}
```

### City Table

```prisma
model City {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  latitude  Float
  longitude Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🐛 Error Codes

| Status Code | Meaning      | Common Cause                   |
| ----------- | ------------ | ------------------------------ |
| 200         | Success      | Request completed successfully |
| 400         | Bad Request  | Invalid city IDs or < 2 cities |
| 401         | Unauthorized | Missing or invalid JWT token   |
| 404         | Not Found    | Endpoint doesn't exist         |
| 500         | Server Error | Database or server issue       |

---

## 📊 Response Time Benchmarks

| Endpoint                          | Expected Response Time              |
| --------------------------------- | ----------------------------------- |
| GET /cities                       | < 100ms                             |
| GET /driver/cities                | < 200ms                             |
| POST /driver/cities               | < 300ms                             |
| GET /driver/route-cities-with-eta | < 2000ms (includes Google Maps API) |

---

## ✅ Testing Checklist

- [ ] Can fetch all cities
- [ ] Can check if driver has route
- [ ] Can save route with valid data
- [ ] Validation rejects < 2 cities
- [ ] Validation rejects invalid city IDs
- [ ] Can update existing route
- [ ] Unauthorized requests are blocked
- [ ] Cities are returned in correct order
- [ ] ETA calculation works
- [ ] Response times are acceptable

---

For more detailed testing scenarios, see `DRIVER_ROUTE_SETUP_TESTING.md`.
