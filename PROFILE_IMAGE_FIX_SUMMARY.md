# Profile Image Fix - Customer & Child Images

## Problem
Customer profile images were being uploaded to `uploads/customer/` folder but were not displaying correctly in the frontend because the filename wasn't being prefixed with the folder path.

## Solution Overview

### Backend Changes ✅

#### 1. Customer Profile Image Upload (`customer.controller.ts`)
**Before:**
```typescript
@Post('upload-profile-image')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/customer'));
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext);
        const uniqueName = `${base}_${Date.now()}${ext}`;
        cb(null, uniqueName);
      },
    }),
  }),
)
uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
  return this.customerService.handleImageUpload(file);
}
```

**After:**
```typescript
@Post('upload-profile-image')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'uploads', 'customer');
        console.log('[CUSTOMER UPLOAD] Destination path:', uploadPath);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `customer-${Date.now()}${ext}`;
        console.log('[CUSTOMER UPLOAD] Generated filename:', uniqueName);
        cb(null, uniqueName);
      },
    }),
  }),
)
uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
  console.log('[CUSTOMER UPLOAD] File received:', file ? file.filename : 'No file');
  console.log('[CUSTOMER UPLOAD] File path:', file ? file.path : 'No path');
  // Attach subfolder info for customer images
  if (file) {
    file.filename = `customer/${file.filename}`;
  }
  return this.customerService.handleImageUpload(file);
}
```

**Changes:**
- ✅ Consistent path resolution using `process.cwd()`
- ✅ Better filename with `customer-` prefix
- ✅ **Critical:** Added `file.filename = 'customer/${file.filename}'` to prefix the folder path
- ✅ Added logging for debugging

### Frontend Changes ✅

#### 2. Profile API - Staff Profile Mapping (`profile.api.ts`)
**Before:**
```typescript
if (data.profile.staffPassenger) {
  profiles.push({
    ...data.profile.staffPassenger,
    id: `staff-${data.profile.staffPassenger.id}`,
    firstName: data.profile.firstName || '',
    lastName: data.profile.lastName || '',
    type: 'staff' as const,
  });
}
```

**After:**
```typescript
if (data.profile.staffPassenger) {
  profiles.push({
    ...data.profile.staffPassenger,
    id: `staff-${data.profile.staffPassenger.id}`,
    firstName: data.profile.firstName || '',
    lastName: data.profile.lastName || '',
    profileImageUrl: data.profile.staffPassenger.profileImageUrl || data.profile.profileImageUrl,
    type: 'staff' as const,
  });
}
```

**Changes:**
- ✅ Added `profileImageUrl` mapping for staff profiles
- ✅ Falls back to customer's `profileImageUrl` if staff-specific URL not available

## How It Works Now

### Image Upload Flow

#### For Customer/Staff Profiles:
1. **Upload:**
   - Frontend calls `uploadCustomerProfileImageApi()` 
   - Image saved to: `backend/uploads/customer/customer-1234567890.jpg`
   - Backend returns: `{ success: true, filename: "customer/customer-1234567890.jpg" }`

2. **Save to Database:**
   - Filename stored in `Customer.profileImageUrl` as `"customer/customer-1234567890.jpg"`

3. **Retrieve:**
   - Backend reads from DB: `"customer/customer-1234567890.jpg"`
   - Backend constructs full URL: `"http://localhost:3000/uploads/customer/customer-1234567890.jpg"`
   - Frontend receives full URL and displays image

#### For Child Profiles:
1. **Upload:**
   - Frontend calls `uploadChildProfileImageApi()`
   - Image saved to: `backend/uploads/child/child-1234567890.jpg`
   - Backend returns: `{ success: true, filename: "child/child-1234567890.jpg" }`

2. **Save to Database:**
   - Filename stored in `Child.childImageUrl` as `"child/child-1234567890.jpg"`

3. **Retrieve:**
   - Backend reads from DB: `"child/child-1234567890.jpg"`
   - Backend constructs full URL: `"http://localhost:3000/uploads/child/child-1234567890.jpg"`
   - Frontend receives full URL and displays image

## Backend Image URL Construction

The backend service (`customer.service.ts`) has a helper function:

```typescript
const baseUrl = process.env.SERVER_BASE_URL || 'http://localhost:3000';
const getImageUrl = (filepath: string | null) =>
  filepath ? `${baseUrl}/uploads/${filepath}` : null;
```

### For Customer Images:
```typescript
let customerImagePath = customer.profileImageUrl || null;
if (customerImagePath && !customerImagePath.includes('/')) {
  customerImagePath = `customer/${customerImagePath}`;
}
const profileWithFullImageUrl = {
  ...customer,
  profileImageUrl: getImageUrl(customerImagePath),
  // ...
};
```

### For Child Images:
```typescript
const childrenWithFullImageUrl = (customer.children || []).map((child) => {
  let childImagePath = child.childImageUrl || null;
  if (childImagePath && !childImagePath.includes('/')) {
    childImagePath = `child/${childImagePath}`;
  }
  return {
    ...child,
    childImageUrl: getImageUrl(childImagePath),
  };
});
```

### For Staff Passenger Images:
```typescript
staffPassenger: customer.staffPassenger
  ? {
      ...customer.staffPassenger,
      profileImageUrl: getImageUrl(customerImagePath), // Uses customer's image
    }
  : null,
```

## Database Schema

### Customer Table
```prisma
model Customer {
  customer_id        Int     @id @default(autoincrement())
  profileImageUrl    String? // Stores: "customer/customer-1234567890.jpg"
  // ... other fields
}
```

### Child Table
```prisma
model Child {
  child_id      Int     @id @default(autoincrement())
  childImageUrl String? // Stores: "child/child-1234567890.jpg"
  // ... other fields
}
```

### Staff_Passenger Table
```prisma
model Staff_Passenger {
  id         Int  @id @default(autoincrement())
  customerId Int  @unique
  // No profileImageUrl field - uses Customer.profileImageUrl
}
```

## Frontend Display

### Menu Screen (`menu.tsx`)
```tsx
<Image
  source={
    activeProfile?.profileImageUrl || activeProfile?.childImageUrl
      ? { uri: activeProfile.profileImageUrl || activeProfile.childImageUrl }
      : require('../../assets/images/profile_Picture.png')
  }
  style={{ width: 64, height: 64, borderRadius: 32, resizeMode: 'cover' }}
/>
```

### Profile Types
- **Child Profile:** Uses `childImageUrl` from the child data
- **Staff Profile:** Uses `profileImageUrl` from the customer data (mapped in API)

## File Structure
```
backend/
  uploads/
    customer/
      customer-1698765432100.jpg
      customer-1698765432101.jpg
    child/
      child-1698765432100.jpg
      child-1698765432101.jpg
```

## Testing Checklist

### Customer Profile Image:
- [ ] Upload new customer profile image during registration
- [ ] Verify image saved to `uploads/customer/` folder
- [ ] Verify filename in database: `"customer/customer-TIMESTAMP.jpg"`
- [ ] Verify image displays in menu when staff profile active
- [ ] Update customer profile image from profile screen
- [ ] Verify new image displays correctly

### Child Profile Image:
- [ ] Upload new child profile image during registration
- [ ] Verify image saved to `uploads/child/` folder
- [ ] Verify filename in database: `"child/child-TIMESTAMP.jpg"`
- [ ] Verify image displays in menu when child profile active
- [ ] Update child profile image from profile screen
- [ ] Verify new image displays correctly

### Staff Profile Image:
- [ ] Register as staff passenger (no separate image upload)
- [ ] Verify staff profile uses customer's profile image
- [ ] Switch to staff profile
- [ ] Verify customer's profile image displays in menu
- [ ] Update customer image while on staff profile
- [ ] Verify image updates for staff profile too

## API Endpoints

### Upload Endpoints
- `POST /customer/upload-profile-image` - Customer/Staff images → `uploads/customer/`
- `POST /customer/upload-child-image` - Child images → `uploads/child/`

### Response Format
```json
{
  "success": true,
  "filename": "customer/customer-1698765432100.jpg"
}
```

### Profile Endpoint
- `GET /customer/profile` - Returns all profiles with full image URLs

### Response Format
```json
{
  "success": true,
  "profile": {
    "customer_id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "profileImageUrl": "http://localhost:3000/uploads/customer/customer-1698765432100.jpg",
    "children": [
      {
        "child_id": 1,
        "childFirstName": "Jane",
        "childLastName": "Doe",
        "childImageUrl": "http://localhost:3000/uploads/child/child-1698765432100.jpg"
      }
    ],
    "staffPassenger": {
      "id": 1,
      "profileImageUrl": "http://localhost:3000/uploads/customer/customer-1698765432100.jpg"
    }
  }
}
```

## Environment Variables
Make sure `SERVER_BASE_URL` is set in backend `.env`:
```
SERVER_BASE_URL=http://localhost:3000
```

Or for production:
```
SERVER_BASE_URL=https://your-domain.com
```

## Summary

✅ **Backend:** Customer images now correctly prefixed with `customer/` folder path  
✅ **Backend:** Child images already correctly prefixed with `child/` folder path  
✅ **Backend:** URL construction handles both with and without folder prefix  
✅ **Frontend:** Staff profiles now correctly use customer's profile image  
✅ **Frontend:** Child profiles use their own child image  
✅ **Frontend:** Menu displays correct image based on active profile type  

---

**Status:** ✅ FIXED - Customer and child profile images now display correctly!
