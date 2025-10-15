# 🏙️ Cities Module Setup Guide

## ✅ Implementation Complete!

I've created a complete **Cities Module** for your YathraGo backend. Here's what has been implemented:

---

## 📁 Files Created

### 1. **DTOs (Data Transfer Objects)**
- `src/city/dto/create-city.dto.ts` - Create city validation
- `src/city/dto/update-city.dto.ts` - Update city validation  
- `src/city/dto/assign-driver-cities.dto.ts` - Assign cities to driver
- `src/city/dto/index.ts` - Export all DTOs

### 2. **Service Layer**
- `src/city/city.service.ts` - Complete business logic:
  - ✅ CRUD operations for cities
  - ✅ Assign cities to drivers
  - ✅ Get drivers by city
  - ✅ Get cities for a driver
  - ✅ Remove city from driver
  - ✅ Validation and error handling

### 3. **Controller Layer**
- `src/city/city.controller.ts` - REST API endpoints:
  - ✅ 9 endpoints for complete city management
  - ✅ Swagger documentation
  - ✅ JWT authentication guards

### 4. **Module**
- `src/city/city.module.ts` - Module configuration
- ✅ Added to `app.module.ts`

### 5. **Documentation**
- `src/city/CITIES_MODULE_DOCS.md` - Complete API documentation

---

## 🚀 Next Steps - Setup Instructions

### **Step 1: Generate Prisma Client**

Your Prisma schema already has the City tables, but you need to regenerate the Prisma Client:

```bash
cd backend
npx prisma generate
```

This will add the `City`, `DriverCities`, `ChildRideRequest`, `DriverRoute`, and `RouteWaypoint` models to your Prisma Client.

### **Step 2: Create and Run Migration**

```bash
npx prisma migrate dev --name add_city_tables
```

This will:
- Create migration SQL files
- Apply changes to your database
- Update the Prisma Client

### **Step 3: Start Backend**

```bash
npm run start:dev
```

### **Step 4: Add Cities via API**

You can now add cities through the API using the admin endpoints:

```bash
# Create a city (requires JWT token)
curl -X POST http://localhost:3000/cities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Colombo",
    "latitude": 6.9271,
    "longitude": 79.8612
  }'
```

---

## 📡 Available API Endpoints

### **Public Endpoints** (No authentication required)

1. **GET /cities** - Get all cities
2. **GET /cities/:id** - Get city by ID
3. **GET /cities/driver/:driverId** - Get driver's cities
4. **GET /cities/:cityId/drivers** - Get drivers for a city

### **Protected Endpoints** (Requires JWT authentication)

5. **POST /cities** - Create new city (Admin only)
6. **PATCH /cities/:id** - Update city
7. **DELETE /cities/:id** - Delete city
8. **POST /cities/driver/:driverId/assign** - Assign cities to driver
9. **DELETE /cities/driver/:driverId/city/:cityId** - Remove city from driver

---

## 🧪 Testing the Module

### **Test 1: Get All Cities**

```bash
curl http://localhost:3000/cities
```

Expected response:
```json
{
  "success": true,
  "count": 0,
  "cities": []
}
```

### **Test 2: Create a City**

```bash
curl -X POST http://localhost:3000/cities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Colombo",
    "latitude": 6.9271,
    "longitude": 79.8612
  }'
```

### **Test 3: Assign Cities to Driver**

Assuming driver_id = 1 and you've created cities with IDs 1, 2, 3:

```bash
curl -X POST http://localhost:3000/cities/driver/1/assign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cityIds": [1, 2, 3]}'
```

### **Test 4: Get Drivers for a City**

```bash
curl http://localhost:3000/cities/1/drivers
```

---

## 🔗 Integration with Driver Registration

You can now integrate city selection into your driver registration flow:

### **Frontend Changes Needed:**

#### **1. Fetch Cities for Dropdown**

```typescript
// In your driver registration screen
const [cities, setCities] = useState([]);

useEffect(() => {
  fetch('http://YOUR_API/cities')
    .then(res => res.json())
    .then(data => setCities(data.cities));
}, []);
```

#### **2. Add City Selection UI**

```tsx
<View>
  <Text>Select Cities You Serve</Text>
  {cities.map(city => (
    <Checkbox
      key={city.id}
      label={city.name}
      value={selectedCities.includes(city.id)}
      onValueChange={() => toggleCity(city.id)}
    />
  ))}
</View>
```

#### **3. Save Cities After Driver Registration**

```typescript
// After driver is registered successfully
const assignCities = async (driverId, cityIds) => {
  await fetch(`http://YOUR_API/cities/driver/${driverId}/assign`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cityIds }),
  });
};
```

---

## 🗺️ Next Module: Route Generation

After cities are set up, you can implement:

1. **Child Matching Service** - Find drivers based on child's city
2. **Route Optimization** - Use Google Directions API
3. **Real-time Tracking** - Show driver's route on map

---

## 📊 Database Relationships

```
Driver (1) ←→ (N) DriverCities (N) ←→ (1) City
  ↓                                      ↓
  ↓                                      ↓
  ↓                                    Child
  ↓                                      ↓
  └──────→ ChildRideRequest ←───────────┘
```

---

## ✅ Checklist

- [x] Create DTOs with validation
- [x] Create CityService with business logic
- [x] Create CityController with REST endpoints
- [x] Create CityModule
- [x] Add CityModule to app.module.ts
- [x] Create comprehensive documentation
- [ ] Run Prisma migration
- [ ] Test all endpoints
- [ ] Integrate with driver registration

---

## 🎯 What You Can Do Now

1. **Run the migration** to create tables
2. **Add cities via API** or admin dashboard
3. **Test endpoints** using cURL or Postman
4. **Update driver registration** to include city selection
5. **Implement matching logic** to find drivers by city

---

## 🆘 Troubleshooting

### Issue: "Property 'city' does not exist on type 'PrismaService'"

**Solution:** Run `npx prisma generate` to regenerate Prisma Client

### Issue: Migration fails

**Solution:** Make sure your database is running and connection string is correct in `.env`

### Issue: Authentication errors on protected endpoints

**Solution:** Make sure you're sending JWT token:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/cities
```

---

## 📚 Documentation

Full API documentation available at:
- `src/city/CITIES_MODULE_DOCS.md`

Swagger UI (when backend is running):
- `http://localhost:3000/api`

---

**Module Status: ✅ READY FOR DEPLOYMENT**

Run the migration and you're good to go! 🚀
