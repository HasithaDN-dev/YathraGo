# 🏙️ Cities Module - Simplified (Fetch Only)

## 📋 What This Module Does

**ONLY 2 Operations:**
1. ✅ **GET all cities** - Fetch all cities in the database
2. ✅ **GET city by ID** - Fetch specific city data by its ID

---

## 🚀 Quick Setup

### Step 1: Run Migration (Creates City Table)
```powershell
cd backend
npx prisma migrate dev --name add_city_table
```

### Step 2: Start Backend
```powershell
npm run start:dev
```

---

## 📡 API Endpoints for Postman

### **Base URL:** `http://localhost:3000`

---

### 1️⃣ **GET All Cities**

**URL:** `http://localhost:3000/cities`  
**Method:** `GET`  
**Authentication:** None required

#### Postman Setup:
1. Open Postman
2. Create new request
3. Set method to `GET`
4. Enter URL: `http://localhost:3000/cities`
5. Click **Send**

#### Response Example:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "name": "Colombo",
      "latitude": 6.9271,
      "longitude": 79.8612
    },
    {
      "id": 2,
      "name": "Kandy",
      "latitude": 7.2906,
      "longitude": 80.6337
    },
    {
      "id": 3,
      "name": "Galle",
      "latitude": 6.0535,
      "longitude": 80.2210
    }
  ]
}
```

---

### 2️⃣ **GET City by ID**

**URL:** `http://localhost:3000/cities/:id`  
**Method:** `GET`  
**Authentication:** None required

#### Postman Setup:
1. Open Postman
2. Create new request
3. Set method to `GET`
4. Enter URL: `http://localhost:3000/cities/1` (replace `1` with any city ID)
5. Click **Send**

#### Example URLs:
- Get city with ID 1: `http://localhost:3000/cities/1`
- Get city with ID 2: `http://localhost:3000/cities/2`
- Get city with ID 5: `http://localhost:3000/cities/5`

#### Response Example (Success):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Colombo",
    "latitude": 6.9271,
    "longitude": 79.8612
  }
}
```

#### Response Example (City Not Found):
```json
{
  "statusCode": 404,
  "message": "City with ID 999 not found",
  "error": "Not Found"
}
```

---

## 🗂️ City Database Schema

```prisma
model City {
  id        Int      @id @default(autoincrement())
  name      String
  latitude  Float
  longitude Float
}
```

**Fields:**
- `id` - Auto-incrementing primary key
- `name` - City name (e.g., "Colombo")
- `latitude` - Geographic latitude (-90 to 90)
- `longitude` - Geographic longitude (-180 to 180)

---

## 🧪 Testing Steps

### Test 1: Get All Cities (Empty Database)
```
GET http://localhost:3000/cities

Expected Response:
{
  "success": true,
  "count": 0,
  "data": []
}
```

### Test 2: Get City by ID (Before Adding Data)
```
GET http://localhost:3000/cities/1

Expected Response:
{
  "statusCode": 404,
  "message": "City with ID 1 not found",
  "error": "Not Found"
}
```

### Test 3: After Adding Cities (manually via database)
```
GET http://localhost:3000/cities

Expected Response:
{
  "success": true,
  "count": 3,
  "data": [ ... array of cities ... ]
}
```

---

## 📥 How to Add Cities to Database

Since this module **only fetches data**, you need to add cities manually:

### Option 1: Direct Database Insert (Recommended)

Use a database tool like **pgAdmin** or run SQL:

```sql
INSERT INTO "City" (name, latitude, longitude) VALUES
('Colombo', 6.9271, 79.8612),
('Kandy', 7.2906, 80.6337),
('Galle', 6.0535, 80.2210),
('Jaffna', 9.6615, 80.0255),
('Negombo', 7.2008, 79.8736);
```

### Option 2: Prisma Studio (GUI)

```powershell
cd backend
npx prisma studio
```

Then manually add cities through the GUI.

### Option 3: Create a Simple Seed Script

Create `backend/add-cities.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.city.createMany({
    data: [
      { name: 'Colombo', latitude: 6.9271, longitude: 79.8612 },
      { name: 'Kandy', latitude: 7.2906, longitude: 80.6337 },
      { name: 'Galle', latitude: 6.0535, longitude: 80.2210 },
    ],
  });
  console.log('Cities added!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```powershell
npx ts-node add-cities.ts
```

---

## 📋 Postman Collection

Create a Postman collection with these 2 requests:

### Collection: "YathraGo - Cities"

#### Request 1: Get All Cities
- **Name:** Get All Cities
- **Method:** GET
- **URL:** `{{baseUrl}}/cities`
- **Variable:** `baseUrl = http://localhost:3000`

#### Request 2: Get City by ID
- **Name:** Get City by ID
- **Method:** GET
- **URL:** `{{baseUrl}}/cities/{{cityId}}`
- **Variables:** 
  - `baseUrl = http://localhost:3000`
  - `cityId = 1` (can be changed per request)

---

## ✅ Module Summary

| Feature | Status |
|---------|--------|
| Get all cities | ✅ Implemented |
| Get city by ID | ✅ Implemented |
| Create city | ❌ Not included |
| Update city | ❌ Not included |
| Delete city | ❌ Not included |
| Authentication | ❌ Not required (public endpoints) |

**Perfect for:** Read-only city data access from your mobile app or frontend.

---

## 🎯 Next Steps

1. ✅ Run migration: `npx prisma migrate dev --name add_city_table`
2. ✅ Start backend: `npm run start:dev`
3. ✅ Add cities to database (SQL, Prisma Studio, or seed script)
4. ✅ Test in Postman using the URLs above
5. ✅ Integrate with your mobile app to fetch cities

---

**Status: ✅ SIMPLIFIED & READY FOR TESTING** 🎉
