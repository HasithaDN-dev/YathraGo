# Driver Profile Image Flow Verification

## Complete Image Upload & Display Flow

### 1. Image Upload Flow (Registration)

**Frontend: `mobile-driver/app/(registration)/reg-personal.tsx`**
```
User selects image → Upload to backend → Get filename → Store in registration data
```

- User picks image using `ImagePicker`
- Image uploaded via `uploadDriverProfileImageApi(token, imageUri)`
- Backend returns: `{ success: true, filename: "driver/driver-1234567890.jpg" }`
- Filename stored in `personalInfo.profileImage`

**Backend: `backend/src/driver/driver.controller.ts`**
```typescript
POST /driver/upload-profile-image
```
- Receives file via multer
- Saves to: `uploads/driver/driver-{timestamp}.jpg`
- Normalizes `.jpe` and `.jpeg` to `.jpg`
- Returns filename with `driver/` prefix: `driver/driver-1234567890.jpg`

**Database Storage:**
- Field: `driver.profile_picture_url`
- Value: `driver/driver-1234567890.jpg` (relative path with folder prefix)

---

### 2. Image Retrieval Flow (Profile Display)

**Frontend: `mobile-driver/lib/api/profile.api.ts`**
```typescript
getDriverProfileApi(token)
```
1. Calls: `GET http://10.21.86.0:3000/driver/profile`
2. Receives response:
```json
{
  "success": true,
  "profile": {
    "driver_id": 123,
    "name": "John Doe",
    "profile_picture_url": "http://10.21.86.0:3000/uploads/driver/driver-1234567890.jpg",
    ...
  }
}
```
3. Transforms to frontend format:
```typescript
{
  id: 123,
  name: "John Doe",
  profileImageUrl: "http://10.21.86.0:3000/uploads/driver/driver-1234567890.jpg",
  ...
}
```

**Backend: `backend/src/driver/driver.service.ts`**
```typescript
getDriverProfile(driverId)
```
1. Fetches from DB: `profile_picture_url = "driver/driver-1234567890.jpg"`
2. Constructs full URL:
   - Base: `process.env.SERVER_BASE_URL` = `http://10.21.86.0:3000`
   - Path: `/uploads/`
   - File: `driver/driver-1234567890.jpg`
   - Result: `http://10.21.86.0:3000/uploads/driver/driver-1234567890.jpg`
3. Returns in response

---

### 3. Image Display Flow (UI Components)

**Component: `mobile-driver/components/ProfileImage.tsx`**
```
Fetch profile → Extract profileImageUrl → Render <Image source={{ uri }} />
```

**Usage Locations:**
- `app/(tabs)/menu.tsx` - Profile header (96x96)
- `app/profile/(personal)/personal.tsx` - Personal info page (96x96)

---

## URL Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. UPLOAD (Registration)                                        │
├─────────────────────────────────────────────────────────────────┤
│ Frontend: file:///path/to/image.jpg                            │
│     ↓                                                           │
│ Upload: POST /driver/upload-profile-image                      │
│     ↓                                                           │
│ Backend: Save to uploads/driver/driver-1234567890.jpg         │
│     ↓                                                           │
│ Return: { filename: "driver/driver-1234567890.jpg" }          │
│     ↓                                                           │
│ Frontend: Store "driver/driver-1234567890.jpg" in state       │
│     ↓                                                           │
│ Submit: POST /driver/register with profile_picture_url        │
│     ↓                                                           │
│ Database: profile_picture_url = "driver/driver-1234567890.jpg"│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2. RETRIEVE (Profile Display)                                   │
├─────────────────────────────────────────────────────────────────┤
│ Frontend: GET /driver/profile                                   │
│     ↓                                                           │
│ Backend: Fetch DB → profile_picture_url = "driver/..."        │
│     ↓                                                           │
│ Backend: Construct full URL:                                    │
│          http://10.21.86.0:3000/uploads/driver/driver-...jpg  │
│     ↓                                                           │
│ Return: { profile: { profile_picture_url: "http://..." } }    │
│     ↓                                                           │
│ Frontend: Transform to profileImageUrl                         │
│     ↓                                                           │
│ Component: <Image source={{ uri: profileImageUrl }} />        │
│     ↓                                                           │
│ React Native: Fetch and display image                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Environment Configuration

**Backend: `backend/.env`**
```env
SERVER_BASE_URL=http://10.21.86.0:3000
```

**Frontend: `mobile-driver/.env`**
```env
EXPO_PUBLIC_API_URL=http://10.21.86.0:3000
```

**Both must match!** ✅

---

## Static File Serving

**Backend: `backend/src/main.ts`**
```typescript
app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});
```

**File System:**
```
backend/
└── uploads/
    ├── driver/
    │   └── driver-1234567890.jpg
    ├── customer/
    └── vehicle/
```

**Accessible at:**
```
http://10.21.86.0:3000/uploads/driver/driver-1234567890.jpg
```

---

## Testing & Verification

### 1. Test Image Upload
```bash
# Get auth token first, then:
curl -X POST http://10.21.86.0:3000/driver/upload-profile-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/image.jpg"

# Expected response:
# { "success": true, "filename": "driver/driver-1234567890.jpg" }
```

### 2. Test Profile Retrieval
```bash
curl http://10.21.86.0:3000/driver/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: profile_picture_url should be full URL
```

### 3. Test Direct Image Access
```bash
# Open in browser:
http://10.21.86.0:3000/uploads/driver/driver-1234567890.jpg

# Should display the image
```

### 4. Test Image URL Construction
```bash
# New test endpoint (no auth required):
curl http://10.21.86.0:3000/driver/test-image-url/123

# Shows:
# - Raw DB value
# - Base URL used
# - Constructed full URL
# - Direct access test link
```

---

## Logging & Debugging

### Backend Logs (In Order)
```
[DRIVER UPLOAD] Destination path: ...
[DRIVER UPLOAD] Generated filename: driver-1234567890.jpg
[DRIVER UPLOAD] File received: driver-1234567890.jpg
[Driver Registration] Profile picture URL being saved: driver/driver-1234567890.jpg
[Driver Registration] Profile saved with image URL: driver/driver-1234567890.jpg

[Driver Controller] GET /driver/profile called
[Driver Service] === getDriverProfile called ===
[Driver Service] Raw profile_picture_url from DB: driver/driver-1234567890.jpg
[Driver Service] Base URL: http://10.21.86.0:3000
[Driver Service] Constructed full URL: http://10.21.86.0:3000/uploads/driver/driver-1234567890.jpg
[Driver Controller] Profile picture URL in response: http://10.21.86.0:3000/uploads/driver/driver-1234567890.jpg
```

### Frontend Logs (In Order)
```
[ProfileImage] === Starting fetchProfilePicture ===
[API] Driver profile raw response: { ... }
[API] Profile picture URL from backend: http://10.21.86.0:3000/uploads/driver/driver-1234567890.jpg
[API] Transformed profileImageUrl: http://10.21.86.0:3000/uploads/driver/driver-1234567890.jpg
[ProfileImage] Profile image URL received: http://10.21.86.0:3000/uploads/driver/driver-1234567890.jpg
[ProfileImage] Testing URL accessibility...
[ProfileImage] URL test response status: 200
[ProfileImage Render] Has URL - Rendering image
🔄 Image load STARTED
🏁 Image load ENDED
✅ Image loaded SUCCESSFULLY
```

---

## Common Issues & Solutions

### ❌ Image not displaying

**Possible Causes:**

1. **Wrong file extension**
   - ❌ `.jpe` files may not work in React Native
   - ✅ Backend now normalizes to `.jpg`

2. **URL mismatch**
   - ❌ Backend uses `192.168.x.x`, frontend uses `10.21.x.x`
   - ✅ Both use `http://10.21.86.0:3000`

3. **CORS issue**
   - ✅ Backend has `origin: true` for all origins

4. **File not accessible**
   - Check: `ls backend/uploads/driver/`
   - Test: Open URL in browser

5. **Database has wrong value**
   - Check DB: Should be `driver/driver-xxxxx.jpg`
   - Not: Full path or local URI

### ✅ Verification Checklist

- [ ] Backend running on `http://10.21.86.0:3000`
- [ ] Frontend `.env` matches backend IP
- [ ] Image exists in `backend/uploads/driver/`
- [ ] Database has `driver/driver-xxxxx.jpg` format
- [ ] Can open image URL in browser
- [ ] Backend logs show full URL construction
- [ ] Frontend logs show URL received
- [ ] Image load events fire (`onLoadStart`, `onLoad`)

---

## File Extensions Handled

**Backend normalizes these to `.jpg`:**
- `.jpeg` → `.jpg`
- `.jpe` → `.jpg`
- `.jpg` → `.jpg` (unchanged)
- `.png` → `.png` (unchanged)

This ensures React Native compatibility.

---

## Next Steps

1. **Test the flow:**
   - Upload a new profile image
   - Complete registration
   - Navigate to menu/profile page
   - Check both backend and frontend logs

2. **If image doesn't show:**
   - Share backend logs (all `[Driver...]` lines)
   - Share frontend logs (all `[ProfileImage]` and `[API]` lines)
   - Test direct URL access in browser

3. **Use test endpoint:**
   ```bash
   curl http://10.21.86.0:3000/driver/test-image-url/YOUR_DRIVER_ID
   ```
   This shows exactly what's in the database and how the URL is constructed.
