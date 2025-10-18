# 📬 POSTMAN GUIDE - Get Driver Profile API

## ✅ **ENDPOINT ACTIVATED**

I've activated the driver profile endpoint. You can now fetch all driver data by driver ID.

---

## 🚀 **POSTMAN REQUEST**

### **Method:** `GET`

### **URL:**
```
http://localhost:3000/driver/profile/1
```

Replace `1` with the actual driver ID you want to query.

---

## 📋 **POSTMAN SETUP**

### **Step 1: Create New Request**
1. Open Postman
2. Click **New** → **HTTP Request**
3. Name it: `Get Driver Profile`

### **Step 2: Configure Request**

| Setting | Value |
|---------|-------|
| **Method** | `GET` |
| **URL** | `http://localhost:3000/driver/profile/1` |
| **Headers** | `Content-Type: application/json` (optional) |
| **Auth** | None |
| **Body** | None |

### **Step 3: Send Request**
Click the **Send** button.

---

## 📊 **EXPECTED RESPONSE**

### **Success Response (Driver Found):**

```json
{
  "success": true,
  "profile": {
    "driver_id": 1,
    "NIC": "199512345678",
    "address": "123 Main Street, Colombo",
    "date_of_birth": "1995-05-15T00:00:00.000Z",
    "date_of_joining": "2024-01-01T00:00:00.000Z",
    "driver_license_back_url": "uploads/vehicle/license_back_123.jpg",
    "driver_license_front_url": "uploads/vehicle/license_front_123.jpg",
    "name": "John Doe",
    "gender": "Male",
    "nic_front_pic_url": "uploads/vehicle/nic_front_123.jpg",
    "nice_back_pic_url": "uploads/vehicle/nic_back_123.jpg",
    "phone": "+94771234567",
    "profile_picture_url": "uploads/vehicle/profile_123.jpg",
    "second_phone": "+94712345678",
    "vehicle_Reg_No": "WP CAB-1234",
    "email": "john.doe@example.com",
    "status": "ACTIVE",
    "registrationStatus": "ACCOUNT_CREATED",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-10-16T08:30:00.000Z"
  }
}
```

### **Error Response (Driver Not Found):**

```json
{
  "statusCode": 400,
  "message": "Driver not found"
}
```

---

## 🔄 **TEST DIFFERENT DRIVERS**

Just change the number in the URL:

```
http://localhost:3000/driver/profile/1   ← Driver ID 1
http://localhost:3000/driver/profile/2   ← Driver ID 2
http://localhost:3000/driver/profile/3   ← Driver ID 3
http://localhost:3000/driver/profile/5   ← Driver ID 5
```

---

## 📝 **COMPLETE POSTMAN EXAMPLES**

### **Example 1: Get Driver ID 1**

**Request:**
```
GET http://localhost:3000/driver/profile/1
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "driver_id": 1,
    "name": "John Doe",
    "phone": "+94771234567",
    "email": "john@example.com",
    "NIC": "199512345678",
    "address": "123 Main St, Colombo",
    "gender": "Male",
    "status": "ACTIVE",
    ...
  }
}
```

---

### **Example 2: Get Driver ID 2**

**Request:**
```
GET http://localhost:3000/driver/profile/2
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "driver_id": 2,
    "name": "Jane Smith",
    "phone": "+94772345678",
    ...
  }
}
```

---

### **Example 3: Invalid Driver ID**

**Request:**
```
GET http://localhost:3000/driver/profile/999
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "Driver not found"
}
```

---

## 🎯 **WHAT DATA YOU GET**

The API returns **ALL driver information** from the database:

| Field | Type | Description |
|-------|------|-------------|
| `driver_id` | Number | Unique driver identifier |
| `name` | String | Driver's full name |
| `phone` | String | Primary phone number |
| `email` | String | Email address |
| `NIC` | String | National Identity Card number |
| `address` | String | Residential address |
| `date_of_birth` | DateTime | Date of birth |
| `date_of_joining` | DateTime | Registration date |
| `gender` | String | Gender |
| `profile_picture_url` | String | Profile image path |
| `driver_license_front_url` | String | License front image |
| `driver_license_back_url` | String | License back image |
| `nic_front_pic_url` | String | NIC front image |
| `nice_back_pic_url` | String | NIC back image |
| `second_phone` | String | Secondary phone |
| `vehicle_Reg_No` | String | Vehicle registration number |
| `status` | String | Account status (ACTIVE/INACTIVE) |
| `registrationStatus` | String | Registration stage |
| `createdAt` | DateTime | Account creation date |
| `updatedAt` | DateTime | Last update date |

---

## 🧪 **TESTING STEPS**

### **1. Start Backend Server:**
```bash
cd backend
npm run start:dev
```

### **2. Wait for Server to Start:**
```
[Nest] LOG [RouterExplorer] Mapped {/driver/profile/:driverId, GET} route
```

### **3. Open Postman**

### **4. Create GET Request:**
- URL: `http://localhost:3000/driver/profile/1`
- Method: GET
- No headers needed (optional: Content-Type: application/json)

### **5. Click Send**

### **6. Verify Response:**
- Status: `200 OK`
- Body: JSON with `success: true` and `profile` object

---

## 🔍 **SQL QUERY BEHIND THE API**

When you call this API, the backend executes:

```sql
SELECT * FROM "Driver" WHERE "driver_id" = 1;
```

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] Backend server running on port 3000
- [ ] Route `/driver/profile/:driverId` registered in logs
- [ ] Postman request configured
- [ ] Driver ID in URL is valid
- [ ] Response received with 200 OK
- [ ] Profile data contains all fields

---

## 📱 **QUICK COPY-PASTE**

### **Postman Request:**
```
Method: GET
URL: http://localhost:3000/driver/profile/1
Headers: Content-Type: application/json
Auth: None
Body: None
```

### **cURL Command (Alternative):**
```bash
curl http://localhost:3000/driver/profile/1
```

### **Browser (Alternative):**
```
http://localhost:3000/driver/profile/1
```
Just paste in your browser address bar!

---

## 🎉 **READY TO USE!**

The endpoint is now active. You can:
- ✅ Get driver data by ID
- ✅ Test in Postman
- ✅ No authentication required
- ✅ Simple URL format
- ✅ Returns complete driver information

**Just change the driver ID in the URL to query different drivers!** 🚀
