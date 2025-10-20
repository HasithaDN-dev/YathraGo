# Complaints & Inquiries Module - Implementation Guide

## Overview
The Complaints & Inquiries module allows users (customers, drivers, staff, etc.) to submit complaints and inquiries, and provides management endpoints to track and resolve them.

## Database Schema

The `ComplaintsInquiries` model is already defined in the Prisma schema:

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

  @@index([category])
  @@index([senderId])
  @@index([senderUserType])
  @@index([status])
  @@index([type])
}
```

### Enums Used

- **UserTypes**: CUSTOMER, WEBUSER, BACKUPDRIVER, DRIVER, VEHICLEOWNER, CHILD, STAFF
- **ComplaintInquiryTypes**: COMPLAINT, INQUIRY
- **ComplaintInquiryCategory**: SYSTEM, DRIVER, PAYMENT, OTHER
- **ComplaintStatus**: PENDING, IN_PROGRESS, RESOLVED

## API Endpoints

### 1. Create Complaint/Inquiry
**POST** `/complaints-inquiries`

Create a new complaint or inquiry.

**Request Body:**
```json
{
  "senderId": 1,
  "senderUserType": "CUSTOMER",
  "type": "COMPLAINT",
  "description": "The driver was late for pickup",
  "category": "DRIVER"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "senderId": 1,
    "senderUserType": "CUSTOMER",
    "type": "COMPLAINT",
    "description": "The driver was late for pickup",
    "category": "DRIVER",
    "status": "PENDING",
    "createdAt": "2025-10-20T10:30:00.000Z"
  },
  "message": "Complaint submitted successfully"
}
```

### 2. Get Records by Sender
**GET** `/complaints-inquiries/sender/:senderId?senderUserType=CUSTOMER`

Retrieve all complaints/inquiries submitted by a specific user.

**Parameters:**
- `senderId` (path): User ID
- `senderUserType` (query): User type (CUSTOMER, DRIVER, etc.)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "senderId": 1,
      "senderUserType": "CUSTOMER",
      "type": "COMPLAINT",
      "description": "The driver was late for pickup",
      "category": "DRIVER",
      "status": "RESOLVED",
      "createdAt": "2025-10-20T10:30:00.000Z"
    }
  ]
}
```

### 3. Get All Records (with filters)
**GET** `/complaints-inquiries?status=PENDING&type=COMPLAINT&category=DRIVER`

Retrieve all complaints/inquiries with optional filters.

**Query Parameters (all optional):**
- `status`: PENDING, IN_PROGRESS, or RESOLVED
- `type`: COMPLAINT or INQUIRY
- `category`: SYSTEM, DRIVER, PAYMENT, or OTHER

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

### 4. Get Single Record
**GET** `/complaints-inquiries/:id`

Retrieve a specific complaint/inquiry by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "senderId": 1,
    "senderUserType": "CUSTOMER",
    "type": "COMPLAINT",
    "description": "The driver was late for pickup",
    "category": "DRIVER",
    "status": "PENDING",
    "createdAt": "2025-10-20T10:30:00.000Z"
  }
}
```

### 5. Update Status
**PATCH** `/complaints-inquiries/:id`

Update the status of a complaint/inquiry.

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "IN_PROGRESS",
    ...
  },
  "message": "Status updated successfully"
}
```

### 6. Delete Record
**DELETE** `/complaints-inquiries/:id`

Delete a complaint/inquiry.

**Response:**
```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

### 7. Get Statistics
**GET** `/complaints-inquiries/statistics`

Get overall statistics about complaints and inquiries.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "byStatus": {
      "pending": 10,
      "inProgress": 15,
      "resolved": 25
    },
    "byType": {
      "complaints": 30,
      "inquiries": 20
    }
  }
}
```

## Usage Examples

### Creating a Complaint (Customer)
```bash
curl -X POST http://localhost:3000/complaints-inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": 5,
    "senderUserType": "CUSTOMER",
    "type": "COMPLAINT",
    "description": "Payment was charged twice for the same trip",
    "category": "PAYMENT"
  }'
```

### Creating an Inquiry (Driver)
```bash
curl -X POST http://localhost:3000/complaints-inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": 12,
    "senderUserType": "DRIVER",
    "type": "INQUIRY",
    "description": "How do I update my vehicle insurance information?",
    "category": "SYSTEM"
  }'
```

### Retrieving Customer's Records
```bash
curl -X GET "http://localhost:3000/complaints-inquiries/sender/5?senderUserType=CUSTOMER"
```

### Filtering by Status
```bash
curl -X GET "http://localhost:3000/complaints-inquiries?status=PENDING"
```

### Updating Status (Admin/Manager)
```bash
curl -X PATCH http://localhost:3000/complaints-inquiries/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESOLVED"
  }'
```

## Module Structure

```
src/complaints-inquiries/
├── dto/
│   ├── create-complaint-inquiry.dto.ts
│   ├── update-complaint-inquiry.dto.ts
│   └── index.ts
├── complaints-inquiries.controller.ts
├── complaints-inquiries.service.ts
└── complaints-inquiries.module.ts
```

## Features Implemented

✅ Create new complaints/inquiries
✅ Retrieve records by sender (senderId + senderUserType)
✅ Retrieve single record by ID
✅ Retrieve all records with filters (status, type, category)
✅ Update complaint/inquiry status
✅ Delete complaints/inquiries
✅ Statistics endpoint for dashboard
✅ Proper validation using class-validator
✅ Error handling and logging
✅ Database indexing for performance

## Integration

The module is fully integrated into the application:
- ✅ Added to `app.module.ts`
- ✅ Uses existing `PrismaModule` for database access
- ✅ Connected to existing `ComplaintsInquiries` model in schema

## Testing

After running the backend server, you can test the endpoints using:
- Postman
- curl commands
- Thunder Client (VS Code extension)
- Your frontend application

## Next Steps

1. **Add Authentication**: Integrate with your auth guards to ensure only authorized users can create/view their complaints
2. **Add Notifications**: Send notifications when status changes
3. **Add Admin Panel**: Create admin views to manage complaints/inquiries
4. **Add File Uploads**: Allow users to attach screenshots or documents
5. **Add Comments/Responses**: Enable back-and-forth communication between users and support team
