# Testing the Complaints & Inquiries Module

## Quick Test Guide

### 1. Start the Backend Server

```bash
cd backend
npm run start:dev
```

### 2. Test Creating a Complaint

Using curl:
```bash
curl -X POST http://localhost:3000/complaints-inquiries \
  -H "Content-Type: application/json" \
  -d "{\"senderId\": 1, \"senderUserType\": \"CUSTOMER\", \"type\": \"COMPLAINT\", \"description\": \"Test complaint\", \"category\": \"DRIVER\"}"
```

Using Postman:
- Method: POST
- URL: `http://localhost:3000/complaints-inquiries`
- Headers: `Content-Type: application/json`
- Body (JSON):
```json
{
  "senderId": 1,
  "senderUserType": "CUSTOMER",
  "type": "COMPLAINT",
  "description": "The driver was 15 minutes late for pickup",
  "category": "DRIVER"
}
```

### 3. Test Retrieving by Sender

```bash
curl "http://localhost:3000/complaints-inquiries/sender/1?senderUserType=CUSTOMER"
```

### 4. Test Getting All Records

```bash
curl "http://localhost:3000/complaints-inquiries"
```

### 5. Test Filtering

```bash
curl "http://localhost:3000/complaints-inquiries?status=PENDING&type=COMPLAINT"
```

### 6. Test Updating Status

```bash
curl -X PATCH http://localhost:3000/complaints-inquiries/1 \
  -H "Content-Type: application/json" \
  -d "{\"status\": \"IN_PROGRESS\"}"
```

### 7. Test Statistics

```bash
curl "http://localhost:3000/complaints-inquiries/statistics"
```

## Validation Tests

The module includes validation. Try these to see error responses:

### Missing Required Fields
```json
{
  "senderId": 1,
  "type": "COMPLAINT"
}
```
Should return validation error.

### Invalid Enum Value
```json
{
  "senderId": 1,
  "senderUserType": "INVALID_TYPE",
  "type": "COMPLAINT",
  "description": "Test",
  "category": "DRIVER"
}
```
Should return validation error for invalid enum.

### Invalid Status Update
```json
{
  "status": "INVALID_STATUS"
}
```
Should return validation error.

## Expected Responses

### Successful Creation
```json
{
  "success": true,
  "data": {
    "id": 1,
    "senderId": 1,
    "senderUserType": "CUSTOMER",
    "type": "COMPLAINT",
    "description": "The driver was 15 minutes late for pickup",
    "category": "DRIVER",
    "status": "PENDING",
    "createdAt": "2025-10-20T10:30:00.000Z"
  },
  "message": "Complaint submitted successfully"
}
```

### Successful Retrieval
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "senderId": 1,
      "senderUserType": "CUSTOMER",
      "type": "COMPLAINT",
      "description": "The driver was 15 minutes late for pickup",
      "category": "DRIVER",
      "status": "PENDING",
      "createdAt": "2025-10-20T10:30:00.000Z"
    }
  ]
}
```

### Not Found Error
```json
{
  "statusCode": 404,
  "message": "Complaint/Inquiry with ID 999 not found",
  "error": "Not Found"
}
```

## Integration with Frontend

### React/React Native Example

```typescript
// Create complaint
const createComplaint = async () => {
  const response = await fetch('http://localhost:3000/complaints-inquiries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      senderId: userId,
      senderUserType: 'CUSTOMER',
      type: 'COMPLAINT',
      description: complaintText,
      category: selectedCategory,
    }),
  });
  
  const result = await response.json();
  console.log(result);
};

// Get user's complaints
const getMyComplaints = async () => {
  const response = await fetch(
    `http://localhost:3000/complaints-inquiries/sender/${userId}?senderUserType=CUSTOMER`
  );
  
  const result = await response.json();
  setComplaints(result.data);
};
```
