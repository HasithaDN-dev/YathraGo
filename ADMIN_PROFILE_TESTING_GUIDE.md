# Admin Profile Module - Quick Testing Guide

## 🚀 Quick Start

### 1️⃣ Environment Setup
Add to your `.env` file:
```bash
ADMIN_JWT_SECRET=your-super-secret-admin-jwt-key-change-this-in-production
```

### 2️⃣ Start Server
```bash
cd backend
npm run start:dev
```

Wait for: `Nest application successfully started`

---

## 🧪 Postman Test Collection

### Step 1: Admin Login
```http
POST http://localhost:3333/admin-auth/login
Content-Type: application/json

{
  "email": "admin@yathrago.com",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "admin": {
    "id": 1,
    "email": "admin@yathrago.com",
    "firstName": "Super",
    "lastName": "Admin"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**📋 Copy the `access_token`** - you'll need it for all other requests!

---

### Step 2: Get Profile
```http
GET http://localhost:3333/admin/profile
Authorization: Bearer <paste_your_token_here>
```

**Expected Response:**
```json
{
  "id": 1,
  "email": "admin@yathrago.com",
  "firstName": "Super",
  "lastName": "Admin",
  "permissions": [],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Step 3: Update Profile
```http
PATCH http://localhost:3333/admin/profile
Authorization: Bearer <paste_your_token_here>
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name"
}
```

**Expected Response:**
```json
{
  "id": 1,
  "email": "admin@yathrago.com",
  "firstName": "Updated",
  "lastName": "Name",
  "permissions": [],
  "isActive": true,
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

---

### Step 4: Change Password
```http
PATCH http://localhost:3333/admin/profile/password
Authorization: Bearer <paste_your_token_here>
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "newPassword456"
}
```

**Expected Response:**
```json
{
  "message": "Password changed successfully. Please login again on all devices."
}
```

**⚠️ IMPORTANT:** After this, your current token will be invalidated! You need to login again.

---

### Step 5: View Activity History
```http
GET http://localhost:3333/admin/profile/activity?limit=10
Authorization: Bearer <paste_your_token_here>
```

**Expected Response:**
```json
[
  {
    "id": 3,
    "action": "CHANGE_PASSWORD",
    "module": "PROFILE",
    "details": null,
    "ipAddress": null,
    "userAgent": null,
    "success": true,
    "errorMessage": null,
    "createdAt": "2024-01-15T12:05:00.000Z"
  },
  {
    "id": 2,
    "action": "UPDATE_PROFILE",
    "module": "PROFILE",
    "details": {
      "changes": {
        "firstName": "Updated",
        "lastName": "Name"
      }
    },
    "ipAddress": null,
    "userAgent": null,
    "success": true,
    "errorMessage": null,
    "createdAt": "2024-01-15T12:03:00.000Z"
  }
]
```

---

## ✅ Validation Tests

### Test 1: Profile Update with Invalid Data
```http
PATCH http://localhost:3333/admin/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "A"
}
```

**Expected Error (400):**
```json
{
  "statusCode": 400,
  "message": ["firstName must be longer than or equal to 2 characters"],
  "error": "Bad Request"
}
```

---

### Test 2: Password Change with Wrong Current Password
```http
PATCH http://localhost:3333/admin/profile/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "wrongPassword",
  "newPassword": "newPassword456"
}
```

**Expected Error (403):**
```json
{
  "statusCode": 403,
  "message": "Current password is incorrect",
  "error": "Forbidden"
}
```

---

### Test 3: Unauthorized Access (No Token)
```http
GET http://localhost:3333/admin/profile
```

**Expected Error (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 🎯 Success Checklist

After testing, verify:

- [ ] ✅ Admin login works and returns JWT token
- [ ] ✅ Profile retrieval shows correct admin data (no password)
- [ ] ✅ Profile update changes firstName/lastName
- [ ] ✅ Password change works with correct current password
- [ ] ✅ Password change fails with wrong current password
- [ ] ✅ Password change invalidates all sessions
- [ ] ✅ Activity history shows all profile actions
- [ ] ✅ Validation errors return 400 with clear messages
- [ ] ✅ Missing auth token returns 401 Unauthorized

---

## 🐛 Troubleshooting

### Error: "Admin not found"
**Solution:** Create an admin account first:
```http
POST http://localhost:3333/admin-auth/register
Content-Type: application/json

{
  "email": "admin@yathrago.com",
  "password": "admin123",
  "firstName": "Super",
  "lastName": "Admin"
}
```

---

### Error: "Unauthorized" even with token
**Causes:**
1. Token expired (login again)
2. Password was changed (invalidated all sessions)
3. Wrong ADMIN_JWT_SECRET in .env
4. Token not in `Authorization: Bearer <token>` format

**Solution:**
- Get a fresh token by logging in again
- Check .env file has ADMIN_JWT_SECRET
- Restart server after .env changes

---

### Error: Cannot connect to database
**Solution:**
```bash
cd backend
npx prisma db push
npx prisma generate
```

---

## 📊 Database Verification

### Check Activity Logs
```sql
SELECT * FROM "AdminActivity" 
WHERE "adminId" = 1 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

### Check Sessions
```sql
SELECT * FROM "AdminSession" 
WHERE "adminId" = 1 
ORDER BY "createdAt" DESC;
```

---

## 🎉 Next Steps

Once all tests pass:
1. ✅ Admin Profile Module is **COMPLETE**
2. 🔄 Integrate with Next.js frontend dashboard
3. 🚀 Proceed to next admin module:
   - User Management (manage webusers, drivers, customers)
   - Backup Management
   - Audit Log Viewer
   - Complaints/Inquiries Management

---

**Status:** Ready for Testing ✅
