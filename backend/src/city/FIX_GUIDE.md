# 🚀 FIX CITY MODULE - Step by Step

## 🔍 Problem Found:
**City table does NOT exist in your Supabase database!**

The schema is defined in `schema.prisma` but was never migrated to the database.

---

## ✅ Solution (3 Commands)

### **Command 1: Create City Table**
```powershell
cd backend
npx prisma migrate dev --name add_city_tables
```

**This creates:**
- City table
- DriverCities table
- ChildRideRequest table
- DriverRoute table
- RouteWaypoint table

**Look for:** "✅ Migration applied successfully"

---

### **Command 2: Regenerate Prisma Client**
```powershell
npx prisma generate
```

**Look for:** "✔ Generated Prisma Client"

---

### **Command 3: Start Backend**
```powershell
npm run start:dev
```

**Look for:**  
```
✅ Prisma connected successfully
Application is running on: http://localhost:3000
```

---

## 📊 Add Test Cities

### **Option A: Using Prisma Studio (GUI)**
```powershell
npx prisma studio
```

1. Opens in browser at `http://localhost:5555`
2. Click "City" table
3. Click "Add record"
4. Enter:
   - name: Colombo
   - latitude: 6.9271
   - longitude: 79.8612
5. Click "Save 1 change"

### **Option B: Using SQL (Supabase Dashboard)**

Go to https://supabase.com/dashboard → SQL Editor → Run this:

```sql
INSERT INTO "City" (name, latitude, longitude, "createdAt", "updatedAt") VALUES
('Colombo', 6.9271, 79.8612, NOW(), NOW()),
('Kandy', 7.2906, 80.6337, NOW(), NOW()),
('Galle', 6.0535, 80.2210, NOW(), NOW()),
('Jaffna', 9.6615, 80.0255, NOW(), NOW()),
('Negombo', 7.2008, 79.8736, NOW(), NOW());
```

---

## 🧪 Test in Postman

### **Test 1: Get All Cities**

**URL:** `http://localhost:3000/cities`  
**Method:** GET  
**Headers:** None  

**Click:** Send

**Expected Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Colombo",
      "latitude": 6.9271,
      "longitude": 79.8612,
      "createdAt": "2025-10-12T...",
      "updatedAt": "2025-10-12T..."
    },
    ...
  ]
}
```

---

### **Test 2: Get City by ID**

**URL:** `http://localhost:3000/cities/1`  
**Method:** GET  
**Headers:** None  

**Click:** Send

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Colombo",
    "latitude": 6.9271,
    "longitude": 79.8612,
    "createdAt": "2025-10-12T...",
    "updatedAt": "2025-10-12T..."
  }
}
```

---

### **Test 3: Get Non-Existent City**

**URL:** `http://localhost:3000/cities/999`  
**Method:** GET  

**Expected Response:**
```json
{
  "statusCode": 404,
  "message": "City with ID 999 not found",
  "error": "Not Found"
}
```

---

## 📋 Postman Collection Setup

### **Create Collection: "YathraGo Cities"**

#### **Request 1: Get All Cities**
- Name: `Get All Cities`
- Method: `GET`
- URL: `http://localhost:3000/cities`
- Save

#### **Request 2: Get City by ID**
- Name: `Get City by ID`
- Method: `GET`
- URL: `http://localhost:3000/cities/1`
- Save

---

## ⚠️ Troubleshooting

### **Error: "Cannot find module '@prisma/client'"**
**Fix:**
```powershell
npx prisma generate
```

### **Error: "relation 'City' does not exist"**
**Fix:**
```powershell
npx prisma migrate dev --name add_city_tables
```

### **Error: "PrismaClientKnownRequestError"**
**Fix:** Table doesn't exist. Run migration.

### **Empty Response: { "success": true, "count": 0, "data": [] }**
**Fix:** No cities in database. Add cities using Prisma Studio or SQL.

### **Error: "Cannot connect to database"**
**Fix:** Check `.env` DATABASE_URL is correct and Supabase is running.

---

## 🎯 Quick Commands Summary

```powershell
# Navigate to backend
cd backend

# Step 1: Create tables
npx prisma migrate dev --name add_city_tables

# Step 2: Regenerate client
npx prisma generate

# Step 3: Start server
npm run start:dev

# Step 4: Open Prisma Studio (add cities)
npx prisma studio
```

---

## ✅ Success Checklist

- [ ] Migration ran successfully
- [ ] Prisma Client regenerated
- [ ] Backend started on port 3000
- [ ] "✅ Prisma connected successfully" logged
- [ ] Added test cities (at least 1)
- [ ] Postman GET /cities returns data
- [ ] Postman GET /cities/1 returns specific city

---

## 📡 Final Postman URLs

```
GET http://localhost:3000/cities
GET http://localhost:3000/cities/1
GET http://localhost:3000/cities/2
GET http://localhost:3000/cities/5
```

---

**That's it! Run the 3 commands and test in Postman.** 🎉
