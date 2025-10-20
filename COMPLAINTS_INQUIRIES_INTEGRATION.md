# Complaints & Inquiries Backend-Frontend Integration

## Overview
Complete integration of the Complaints & Inquiries feature connecting the NestJS backend with React Native frontend (mobile-customer app).

## Backend Implementation

### 1. API Endpoints
**Base URL:** `/complaints-inquiries`

#### Create Complaint/Inquiry
- **Method:** POST
- **Endpoint:** `/complaints-inquiries`
- **Body:**
  ```json
  {
    "senderId": 1,
    "senderUserType": "CHILD" | "STAFF",
    "type": "COMPLAINT" | "INQUIRY",
    "description": "Description text",
    "category": "SYSTEM" | "DRIVER" | "PAYMENT" | "OTHER"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": { ComplaintInquiry object },
    "message": "Complaint/Inquiry submitted successfully"
  }
  ```

#### Get Complaints/Inquiries by Sender
- **Method:** GET
- **Endpoint:** `/complaints-inquiries/sender/:senderId?senderUserType=CHILD`
- **Response:**
  ```json
  {
    "success": true,
    "count": 5,
    "data": [ ComplaintInquiry objects ]
  }
  ```
- **Sorting:** Results are sorted by status (PENDING → IN_PROGRESS → RESOLVED) and then by creation date (newest first)

### 2. Backend Files

#### Service: `backend/src/complaints-inquiries/complaints-inquiries.service.ts`
- ✅ `create()` - Creates new complaint/inquiry
- ✅ `findBySender()` - Retrieves all records for a specific sender with sorting
- ✅ Status-based sorting implemented (PENDING first, then IN_PROGRESS, then RESOLVED)

#### Controller: `backend/src/complaints-inquiries/complaints-inquiries.controller.ts`
- ✅ POST `/complaints-inquiries` endpoint
- ✅ GET `/complaints-inquiries/sender/:senderId` endpoint with query params

#### DTOs: `backend/src/complaints-inquiries/dto/`
- ✅ `CreateComplaintInquiryDto` - Validation for creating records
- ✅ `UpdateComplaintInquiryDto` - Validation for updating records

#### Module: `backend/src/complaints-inquiries/complaints-inquiries.module.ts`
- ✅ Integrated into main app module

## Frontend Implementation

### 1. API Client
**File:** `mobile-customer/lib/api/complaints-inquiries.api.ts`

#### Functions:
- ✅ `createComplaintInquiry()` - Submit new complaint/inquiry
- ✅ `getComplaintsInquiries()` - Fetch complaints/inquiries for active profile

#### TypeScript Interfaces:
```typescript
interface ComplaintInquiry {
  id: number;
  senderId: number;
  senderUserType: 'CHILD' | 'STAFF';
  type: 'COMPLAINT' | 'INQUIRY';
  description: string;
  category: 'SYSTEM' | 'DRIVER' | 'PAYMENT' | 'OTHER';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}
```

### 2. Display Screen
**File:** `mobile-customer/app/(menu)/complaint_Inquiries.tsx`

#### Features Implemented:
- ✅ **Auto-fetch on screen focus:** Uses `useFocusEffect` to reload data when returning to screen
- ✅ **Active Profile Integration:** Gets `senderId` and `senderUserType` from `profile.store.ts`
- ✅ **Authentication:** Uses `accessToken` from `auth.store.ts`
- ✅ **Status Badge Display:** Shows color-coded status badges on each card
  - 🟡 Yellow: PENDING
  - 🔵 Blue: IN_PROGRESS
  - 🟢 Green: RESOLVED
- ✅ **Loading State:** Shows spinner while fetching data
- ✅ **Error Handling:** Displays error messages if fetch fails
- ✅ **Empty State:** Shows message when no records found
- ✅ **Tab Switching:** Separate tabs for Complaints and Inquiries
- ✅ **Expandable Cards:** Tap to expand/collapse descriptions
- ✅ **Date/Time Formatting:** Displays formatted date and time

#### Key Functions:
```typescript
- fetchData() - Fetches data from backend
- formatDateTime() - Formats ISO date to readable format
- getStatusColor() - Returns color class for status badge
- formatStatus() - Formats status text (removes underscores)
```

### 3. Add/Submit Screen
**File:** `mobile-customer/app/(menu)/(complaintInquiries)/add_complaint_inquiries.tsx`

#### Features Implemented:
- ✅ **Category Dropdown:** Modal selector for SYSTEM, DRIVER, PAYMENT, OTHER
- ✅ **Description Field:** Multi-line text input with validation
- ✅ **Form Validation:** Validates category and description before submission
- ✅ **Active Profile Integration:** Automatically uses active profile ID and type
- ✅ **API Submission:** Posts data to backend with loading state
- ✅ **Success Feedback:** Alert dialog on successful submission
- ✅ **Auto-Navigation:** Returns to previous screen after successful submission
- ✅ **Error Handling:** Displays error alert if submission fails
- ✅ **Loading Indicator:** Shows spinner on submit button during submission

#### Key Functions:
```typescript
- handleSubmit() - Validates and submits form data to backend
```

## Data Flow

### Creating a Complaint/Inquiry:
1. User selects active profile (CHILD or STAFF) → stored in `profile.store.ts`
2. User navigates to Add Complaint/Inquiry screen
3. User selects category from dropdown
4. User enters description
5. User clicks Submit
6. Frontend extracts:
   - `senderId` from `activeProfile.id`
   - `senderUserType` from `activeProfile.type` (mapped to CHILD/STAFF)
   - `accessToken` from `auth.store.ts`
7. API call to POST `/complaints-inquiries` with DTO
8. Backend creates record with status = PENDING
9. Success alert shown, form reset, navigate back
10. List screen auto-refreshes via `useFocusEffect`

### Viewing Complaints/Inquiries:
1. Screen mounts or comes into focus
2. Frontend extracts:
   - `senderId` from `activeProfile.id`
   - `senderUserType` from `activeProfile.type`
   - `accessToken` from `auth.store.ts`
3. API call to GET `/complaints-inquiries/sender/:senderId?senderUserType=...`
4. Backend retrieves and sorts records:
   - Primary sort: status (PENDING → IN_PROGRESS → RESOLVED)
   - Secondary sort: createdAt (newest first)
5. Frontend separates records into Complaints and Inquiries
6. Displays in respective tabs with status badges

## Prisma Schema

### ComplaintsInquiries Model:
```prisma
model ComplaintsInquiries {
  id             Int                      @id @default(autoincrement())
  senderId       Int
  senderUserType UserTypes
  type           ComplaintInquiryTypes
  description    String
  category       ComplaintInquiryCategory
  status         ComplaintStatus          @default(PENDING)
  createdAt      DateTime                 @default(now())

  @@index([senderId])
  @@index([type])
  @@index([category])
  @@index([senderUserType])
  @@index([status])
}
```

### Enums:
```prisma
enum UserTypes {
  CUSTOMER, WEBUSER, BACKUPDRIVER, DRIVER, VEHICLEOWNER, CHILD, STAFF
}

enum ComplaintInquiryCategory {
  SYSTEM, DRIVER, PAYMENT, OTHER
}

enum ComplaintInquiryTypes {
  COMPLAINT, INQUIRY
}

enum ComplaintStatus {
  PENDING, IN_PROGRESS, RESOLVED
}
```

## Testing Guide

### 1. Test Creating a Complaint:
1. Start backend: `npm run start:dev`
2. Open mobile-customer app
3. Select a CHILD or STAFF profile
4. Navigate to Complaint and Inquiries
5. Tap "Add Complaint"
6. Select category (e.g., SYSTEM)
7. Enter description
8. Tap "Submit Complaint"
9. Verify success alert
10. Check database for new record with status=PENDING

### 2. Test Viewing Complaints:
1. With existing data in database
2. Navigate to Complaint and Inquiries screen
3. Verify loading spinner appears briefly
4. Verify complaints appear sorted by status
5. Verify status badges show correct colors
6. Tap a card to expand/collapse
7. Switch to Inquiries tab
8. Verify inquiries load separately

### 3. Test with Multiple Profiles:
1. Create complaints for different profiles (CHILD vs STAFF)
2. Switch active profile in app
3. Verify only records for active profile are shown
4. Submit new complaint as different profile
5. Verify it appears only for that profile

### 4. Test Error Handling:
1. Turn off backend
2. Try to load complaints → Should show error message
3. Try to submit complaint → Should show error alert
4. Turn backend back on
5. Pull to refresh → Should load data successfully

## API Authentication

All endpoints require Bearer token authentication:
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`
}
```

## Status Workflow

1. **PENDING** (default) - New submission, awaiting review
2. **IN_PROGRESS** - Being worked on by admin/support
3. **RESOLVED** - Issue resolved/question answered

Note: Status updates are currently manual (backend only). Future enhancement: Admin dashboard to update status.

## Future Enhancements

- [ ] Push notifications when status changes
- [ ] Admin response/comment field
- [ ] Image attachment support
- [ ] Filter by status/category
- [ ] Search functionality
- [ ] Pagination for large datasets
- [ ] Pull-to-refresh gesture
- [ ] Admin dashboard for managing complaints

## File Structure

```
backend/
  └── src/
      └── complaints-inquiries/
          ├── complaints-inquiries.controller.ts
          ├── complaints-inquiries.service.ts
          ├── complaints-inquiries.module.ts
          └── dto/
              ├── create-complaint-inquiry.dto.ts
              ├── update-complaint-inquiry.dto.ts
              └── index.ts

mobile-customer/
  ├── lib/
  │   └── api/
  │       └── complaints-inquiries.api.ts
  └── app/
      └── (menu)/
          ├── complaint_Inquiries.tsx
          └── (complaintInquiries)/
              └── add_complaint_inquiries.tsx
```

## Troubleshooting

### Issue: No data appears
- Check if active profile is set in profile store
- Verify accessToken exists in auth store
- Check backend is running on correct port
- Verify database contains records for that senderId

### Issue: Submit fails
- Check form validation (category and description required)
- Verify active profile is set
- Check network connection
- Check backend logs for validation errors

### Issue: Status badge not showing
- Verify status field exists in database records
- Check status enum values match (PENDING, IN_PROGRESS, RESOLVED)
- Ensure frontend is receiving status in API response

## Success Criteria ✅

- ✅ Backend endpoints functional and tested
- ✅ Frontend can create complaints/inquiries
- ✅ Frontend can retrieve and display complaints/inquiries
- ✅ Status badges display correctly with colors
- ✅ Data properly filtered by active profile (senderId + senderUserType)
- ✅ Loading and error states handled
- ✅ Form validation working
- ✅ Navigation flow complete
- ✅ Auto-refresh on screen focus
- ✅ Sorting by status and date implemented

---

**Implementation Status:** ✅ COMPLETE
**Last Updated:** 2025-10-20
