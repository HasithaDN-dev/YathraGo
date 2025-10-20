# Admin Profile Module - Complete Documentation

## ✅ Implementation Status: COMPLETE

The Admin Profile Module has been successfully implemented, providing self-service profile management for administrators.

---

## 📁 Module Structure

```
backend/src/admin/
├── admin.module.ts           # Parent module aggregating all admin features
└── profile/
    ├── dto/
    │   ├── update-profile.dto.ts     # Profile update validation
    │   ├── change-password.dto.ts    # Password change validation
    │   └── index.ts                  # DTO exports
    ├── profile.controller.ts         # HTTP endpoints
    ├── profile.service.ts            # Business logic
    └── profile.module.ts             # Profile module definition
```

---

## 🔌 API Endpoints

All endpoints require **Admin JWT Authentication** (Bearer token in Authorization header).

### 1. Get Profile
```http
GET /admin/profile
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "admin@yathrago.com",
  "firstName": "John",
  "lastName": "Doe",
  "permissions": ["USER_MANAGEMENT", "BACKUP_MANAGEMENT"],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. Update Profile
```http
PATCH /admin/profile
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Request Body:**
- `firstName` (optional): Minimum 2 characters
- `lastName` (optional): Minimum 2 characters

**Response:**
```json
{
  "id": 1,
  "email": "admin@yathrago.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "permissions": ["USER_MANAGEMENT"],
  "isActive": true,
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Activity Log Created:**
```json
{
  "adminId": 1,
  "action": "UPDATE_PROFILE",
  "module": "PROFILE",
  "details": {
    "changes": {
      "firstName": "Jane",
      "lastName": "Smith"
    }
  },
  "success": true
}
```

---

### 3. Change Password
```http
PATCH /admin/profile/password
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Request Body:**
- `currentPassword` (required): Current password
- `newPassword` (required): Minimum 8 characters

**Response (Success):**
```json
{
  "message": "Password changed successfully. Please login again on all devices."
}
```

**Response (Wrong Password):**
```json
{
  "statusCode": 403,
  "message": "Current password is incorrect",
  "error": "Forbidden"
}
```

**Security Features:**
- ✅ Verifies current password with Argon2
- ✅ Hashes new password with Argon2
- ✅ Invalidates ALL active sessions (forces re-login)
- ✅ Logs both successful and failed attempts

**Activity Logs:**

Success:
```json
{
  "adminId": 1,
  "action": "CHANGE_PASSWORD",
  "module": "PROFILE",
  "success": true
}
```

Failed attempt:
```json
{
  "adminId": 1,
  "action": "CHANGE_PASSWORD",
  "module": "PROFILE",
  "success": false,
  "errorMessage": "Invalid current password"
}
```

---

### 4. Get Activity History
```http
GET /admin/profile/activity?limit=100
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of records (default: 50)

**Response:**
```json
[
  {
    "id": 123,
    "action": "CHANGE_PASSWORD",
    "module": "PROFILE",
    "details": null,
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "success": true,
    "errorMessage": null,
    "createdAt": "2024-01-15T11:30:00.000Z"
  },
  {
    "id": 122,
    "action": "UPDATE_PROFILE",
    "module": "PROFILE",
    "details": {
      "changes": {
        "firstName": "Jane"
      }
    },
    "ipAddress": "192.168.1.100",
    "userAgent": "PostmanRuntime/7.36.0",
    "success": true,
    "errorMessage": null,
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
]
```

---

## 🔐 Security Features

### Authentication
- All endpoints protected by `@UseGuards(AdminJwtGuard)`
- Requires valid JWT token from admin login
- Token must contain admin ID and email

### Password Security
- Current password verification required
- Argon2 hashing (same as existing system)
- Session invalidation after password change
- Failed password attempts logged

### Activity Logging
- All profile changes logged to `AdminActivity` table
- Includes IP address and User-Agent (if middleware configured)
- Tracks both success and failure
- Immutable audit trail

---

## 🧪 Testing with Postman

### Setup
1. **Login as Admin** (get JWT token):
```http
POST http://localhost:3333/admin-auth/login
Content-Type: application/json

{
  "email": "admin@yathrago.com",
  "password": "yourPassword123"
}
```

2. **Copy the `access_token` from response**

3. **Add to Authorization header** for all profile requests:
```
Authorization: Bearer <paste_token_here>
```

### Test Sequence

**1. View Profile:**
```http
GET http://localhost:3333/admin/profile
```

**2. Update Name:**
```http
PATCH http://localhost:3333/admin/profile
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name"
}
```

**3. Change Password:**
```http
PATCH http://localhost:3333/admin/profile/password
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**4. View Activity:**
```http
GET http://localhost:3333/admin/profile/activity?limit=20
```

---

## 📊 Database Impact

### Tables Used (No Changes)
- ✅ **Admin** - Existing table, no modifications
- ✅ **AdminActivity** - New table (already created in schema)

### Operations
- **Read**: `admin.findUnique()` for profile retrieval
- **Update**: `admin.update()` for profile and password changes
- **Create**: `adminActivity.create()` for logging
- **Query**: `adminActivity.findMany()` for activity history
- **Bulk Update**: `adminSession.updateMany()` to invalidate sessions

---

## 🎯 Key Features

### ✅ Implemented
1. **Profile View** - Get current admin details (excludes password)
2. **Profile Update** - Change first/last name
3. **Password Change** - Secure password update with validation
4. **Activity History** - View all profile-related actions
5. **Session Management** - Auto-logout on password change
6. **Audit Logging** - Complete activity trail

### 🔒 Security Measures
- JWT authentication on all routes
- Password verification before changes
- Argon2 hashing (matching existing system)
- Session invalidation
- Failed attempt logging
- No password in responses

### 📝 Validation
- First/last name: minimum 2 characters
- New password: minimum 8 characters
- Current password: required for password changes

---

## 🔗 Integration

### Registered in App Module
```typescript
// backend/src/app.module.ts
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // ...other modules
    AdminAuthModule,
    AdminModule,
  ],
})
```

### Module Dependencies
- `ProfileModule` → uses `PrismaService` (auto-injected, global)
- `ProfileController` → uses `AdminJwtGuard` from `AdminAuthModule`
- `ProfileController` → uses `GetAdmin` decorator from `AdminAuthModule`

---

## 🚀 Next Steps

The Profile Module is **complete and ready to use**. You can now:

1. **Test all endpoints** using Postman
2. **Integrate with frontend** (Next.js dashboard already has UI pages)
3. **Proceed to next module**:
   - User Management Module (manage webusers, drivers, customers)
   - Backup Management Module
   - Audit Log Viewer Module
   - Complaints/Inquiries Management Module

---

## 📝 Quick Reference

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/admin/profile` | GET | Get profile | ✅ Admin JWT |
| `/admin/profile` | PATCH | Update profile | ✅ Admin JWT |
| `/admin/profile/password` | PATCH | Change password | ✅ Admin JWT |
| `/admin/profile/activity` | GET | View activity | ✅ Admin JWT |

**Status:** ✅ Ready for Testing and Integration
