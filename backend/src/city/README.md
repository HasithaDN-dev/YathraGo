# 🏙️ Cities Module - Complete Setup Guide

## ✅ What Has Been Created

A complete **Cities Module** for managing city-based driver-child matching in YathraGo.

### 📁 Files Created:

1. **DTOs** (Data Transfer Objects)
   - `src/city/dto/create-city.dto.ts` - Validation for creating cities
   - `src/city/dto/update-city.dto.ts` - Validation for updating cities
   - `src/city/dto/assign-driver-cities.dto.ts` - Assign multiple cities to drivers
   - `src/city/dto/index.ts` - Export all DTOs

2. **Service Layer**
   - `src/city/city.service.ts` - Business logic with 10 methods:
     - CRUD operations (create, findAll, findOne, update, remove)
     - Driver-city relationships (assignCitiesToDriver, getDriverCities, getDriversByCity, removeCityFromDriver)

3. **Controller Layer**
   - `src/city/city.controller.ts` - REST API with 9 endpoints

4. **Module Configuration**
   - `src/city/city.module.ts` - Module definition
   - ✅ Registered in `src/app.module.ts`

---

## 🚀 Setup Instructions

### Step 1: Generate Prisma Client

The Prisma schema already has the City tables defined. Generate the Prisma client to access them:

\`\`\`powershell
cd backend
npx prisma generate
\`\`\`

This adds these models to your Prisma Client:
- `City`
- `DriverCities`  
- `ChildRideRequest`
- `DriverRoute`
- `RouteWaypoint`

### Step 2: Run Database Migration

Create and apply the database migration:

\`\`\`powershell
npx prisma migrate dev --name add_city_matching_system
\`\`\`

This will:
- Create SQL migration files
- Apply changes to your PostgreSQL database
- Create the tables

### Step 3: Start the Backend

\`\`\`powershell
npm run start:dev
\`\`\`

---

## 📡 API Endpoints

### Public Endpoints (No Auth Required)

#### 1. **GET /cities** - Get all cities
\`\`\`bash
curl http://localhost:3000/cities
\`\`\`

Response:
\`\`\`json
{
  "success": true,
  "count": 0,
  "cities": []
}
\`\`\`

#### 2. **GET /cities/:id** - Get single city
\`\`\`bash
curl http://localhost:3000/cities/1
\`\`\`

#### 3. **GET /cities/driver/:driverId** - Get driver's cities
\`\`\`bash
curl http://localhost:3000/cities/driver/1
\`\`\`

#### 4. **GET /cities/:cityId/drivers** - Get all drivers for a city
\`\`\`bash
curl http://localhost:3000/cities/1/drivers
\`\`\`

### Protected Endpoints (Requires JWT Token)

#### 5. **POST /cities** - Create new city
\`\`\`bash
curl -X POST http://localhost:3000/cities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Colombo",
    "latitude": 6.9271,
    "longitude": 79.8612
  }'
\`\`\`

#### 6. **PATCH /cities/:id** - Update city
\`\`\`bash
curl -X PATCH http://localhost:3000/cities/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Colombo District",
    "latitude": 6.9271,
    "longitude": 79.8612
  }'
\`\`\`

#### 7. **DELETE /cities/:id** - Delete city
\`\`\`bash
curl -X DELETE http://localhost:3000/cities/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

#### 8. **POST /cities/driver/:driverId/assign** - Assign cities to driver
\`\`\`bash
curl -X POST http://localhost:3000/cities/driver/1/assign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cityIds": [1, 2, 3]}'
\`\`\`

#### 9. **DELETE /cities/driver/:driverId/city/:cityId** - Remove city from driver
\`\`\`bash
curl -X DELETE http://localhost:3000/cities/driver/1/city/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

---

## 🧪 Testing the Module

### Test 1: Verify Module is Working

\`\`\`powershell
curl http://localhost:3000/cities
\`\`\`

Expected: `{"success": true, "count": 0, "cities": []}`

### Test 2: Add Cities via API

You'll need to add cities through the API. Here are some Sri Lankan cities:

\`\`\`bash
# Colombo
curl -X POST http://localhost:3000/cities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Colombo", "latitude": 6.9271, "longitude": 79.8612}'

# Kandy
curl -X POST http://localhost:3000/cities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Kandy", "latitude": 7.2906, "longitude": 80.6337}'

# Galle
curl -X POST http://localhost:3000/cities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Galle", "latitude": 6.0535, "longitude": 80.2210}'
\`\`\`

### Test 3: Assign Cities to Driver

\`\`\`bash
curl -X POST http://localhost:3000/cities/driver/1/assign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cityIds": [1, 2]}'
\`\`\`

Response:
\`\`\`json
{
  "success": true,
  "message": "Successfully assigned 2 cities to driver",
  "count": 2
}
\`\`\`

### Test 4: Find Drivers by City

\`\`\`bash
curl http://localhost:3000/cities/1/drivers
\`\`\`

---

## 🔗 Integration with Driver Registration

### Frontend Integration Steps:

#### 1. Fetch Available Cities

Add this to your driver registration flow:

\`\`\`typescript
// Fetch cities when component mounts
const [cities, setCities] = useState([]);
const [selectedCities, setSelectedCities] = useState([]);

useEffect(() => {
  fetch('http://YOUR_API_URL/cities')
    .then(res => res.json())
    .then(data => setCities(data.cities));
}, []);
\`\`\`

#### 2. Add City Selection UI

Add a new screen or section in registration:

\`\`\`tsx
<View>
  <Text style={styles.title}>Which cities do you serve?</Text>
  <Text style={styles.subtitle}>Select all cities where you can pick up children</Text>
  
  {cities.map(city => (
    <TouchableOpacity
      key={city.id}
      style={[
        styles.cityCard,
        selectedCities.includes(city.id) && styles.selectedCity
      ]}
      onPress={() => toggleCity(city.id)}
    >
      <Text>{city.name}</Text>
      {selectedCities.includes(city.id) && <Icon name="check" />}
    </TouchableOpacity>
  ))}
</View>
\`\`\`

#### 3. Save Cities After Driver Registration

\`\`\`typescript
// After driver registration is successful
const assignCitiesToDriver = async (driverId: number, cityIds: number[]) => {
  try {
    const response = await fetch(
      `http://YOUR_API_URL/cities/driver/${driverId}/assign`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cityIds }),
      }
    );
    
    const data = await response.json();
    console.log('Cities assigned:', data);
  } catch (error) {
    console.error('Failed to assign cities:', error);
  }
};

// Call after registration
await assignCitiesToDriver(newDriverId, selectedCities);
\`\`\`

---

## 💡 Why No Seeds?

**Seeds are optional!** They're just convenience scripts to pre-populate data. 

### You don't need seeds because:

1. **Admin can add cities via API** - Use POST /cities endpoint
2. **Can add through admin dashboard** - Build a UI for city management
3. **Flexible approach** - Add cities as needed for your regions
4. **Production-ready** - In production, you'll manage cities through your admin panel anyway

### Seeds would only be useful for:
- Quick local development setup
- Demo environments
- Testing with predefined data

**Your approach is cleaner** - cities will be added through the API as needed! 🎯

---

## 📊 Database Architecture

\`\`\`
Driver (1) ←→ (N) DriverCities (N) ←→ (1) City
  │                                      │
  │                                      │
  └──────→ ChildRideRequest ←───────────┘
             │
             ↓
        DriverRoute
             │
             ↓
      RouteWaypoint (ordered waypoints for pickup)
\`\`\`

### How It Works:

1. **Admin adds cities** via POST /cities
2. **Drivers select cities** they serve during registration
3. **Children select nearest city** + pin exact home location
4. **Matching algorithm** finds drivers who serve that city
5. **Route optimizer** generates optimal pickup route using Google Maps API

---

## ✅ Checklist

- [x] Create DTOs with validation
- [x] Implement CityService with business logic
- [x] Implement CityController with REST endpoints
- [x] Create CityModule
- [x] Register CityModule in app.module.ts
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate dev`
- [ ] Start backend `npm run start:dev`
- [ ] Test endpoints with cURL
- [ ] Add initial cities via API
- [ ] Integrate city selection in driver registration

---

## 🎯 Next Steps

### 1. **Run the migration** ✅ MOST IMPORTANT
\`\`\`powershell
cd backend
npx prisma generate
npx prisma migrate dev --name add_city_matching_system
npm run start:dev
\`\`\`

### 2. **Add some cities**
Use POST /cities endpoint to add your first few cities

### 3. **Update driver registration**
Add city selection UI in the mobile app

### 4. **Build matching service**
Create a service that uses `getDriversByCity()` to find available drivers

### 5. **Implement route optimization**
Use Google Directions API to generate optimal pickup routes

---

## 🆘 Troubleshooting

### Issue: "Property 'city' does not exist on type 'PrismaService'"

**Solution:** Run `npx prisma generate` to regenerate the Prisma client

### Issue: Migration fails

**Solution:** 
- Check database is running: `pg_isready`
- Verify connection string in `.env`
- Check DATABASE_URL format

### Issue: "Cannot assign cities to driver"

**Solution:**
- Make sure driver is registered first
- Verify cities exist: `curl http://localhost:3000/cities`
- Check JWT token is valid

---

## 📚 Swagger Documentation

When backend is running, visit:
**http://localhost:3000/api**

You'll see all endpoints with:
- Request/response schemas
- Try-it-out functionality
- Authentication setup

---

## 🚀 Module Status: ✅ READY

All code is complete. Just run the migration and you're good to go!

**No seeds needed - cities will be added through the API** 🎉
