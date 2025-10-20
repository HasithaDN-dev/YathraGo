# Quick Start Guide - YathraGo Backend Setup

## 🚀 Setup Steps

### 1. Generate Prisma Client

```powershell
cd C:\Projects\YathraGo\backend
npx prisma generate
```

This will generate the Prisma client with all the new models:
- VehicleAlert
- AuditLog  
- PaymentRefund

### 2. Create and Apply Migration

```powershell
npx prisma migrate dev --name add_complaints_payments_modules
```

This creates a migration for the new schema changes.

### 3. Start Backend Server

```powershell
npm run start:dev
```

Server should start on `http://localhost:3001`

---

## ✅ Verify Installation

### Test Complaints Endpoint
```powershell
curl http://localhost:3001/complaints/statistics
```

Expected response:
```json
{
  "overview": {
    "total": 0,
    "pending": 0,
    "inProgress": 0,
    "resolved": 0
  },
  "byCategory": [],
  "byType": [],
  "recent": []
}
```

### Test Payments Endpoint
```powershell
curl http://localhost:3001/payments/statistics
```

Expected response:
```json
{
  "overview": {
    "total": 0,
    "pending": 0,
    "paid": 0,
    "overdue": 0
  },
  "revenue": {
    "today": 0,
    "thisMonth": 0
  }
}
```

### Test Refunds Endpoint
```powershell
curl http://localhost:3001/payments/refunds/statistics
```

Expected response:
```json
{
  "overview": {
    "total": 0,
    "pending": 0,
    "approved": 0,
    "rejected": 0
  },
  "totalRefundAmount": 0
}
```

### Test Payouts Endpoint
```powershell
curl http://localhost:3001/payments/payouts/pending
```

Expected: Array of pending payouts (likely empty initially)

---

## 📊 Available Endpoints

### Complaints Module
- `GET /complaints` - List all complaints
- `POST /complaints` - Create complaint
- `GET /complaints/statistics` - Get statistics
- `GET /complaints/:id` - Get specific complaint
- `PATCH /complaints/:id` - Update complaint
- `PATCH /complaints/:id/status` - Update status

### Payments Module
- `GET /payments` - List payments
- `POST /payments` - Create payment
- `GET /payments/statistics` - Payment statistics
- `PATCH /payments/:id/verify` - Verify payment
- `PATCH /payments/:id/mark-paid` - Mark as paid

### Payouts
- `GET /payments/payouts/pending` - Pending payouts
- `POST /payments/payouts/calculate` - Calculate payout
- `POST /payments/payouts/approve` - Approve payout
- `GET /payments/payouts/driver/:id` - Driver history

### Refunds
- `POST /payments/refunds` - Request refund
- `GET /payments/refunds` - List refunds
- `GET /payments/refunds/statistics` - Statistics
- `PATCH /payments/refunds/:id/approve` - Approve
- `PATCH /payments/refunds/:id/reject` - Reject

---

## 🔧 Troubleshooting

### Error: "Cannot find module '@prisma/client'"
**Solution:**
```powershell
npx prisma generate
```

### Error: "PrismaClientValidationError"
**Solution:**
```powershell
npx prisma migrate dev
npx prisma generate
```

### Error: "Module not found: ComplaintsModule"
**Solution:** Make sure app.module.ts includes:
```typescript
import { ComplaintsModule } from './complaints/complaints.module';
import { PaymentsModule } from './payments/payments.module';
```

### Port already in use
**Solution:**
```powershell
# Find process on port 3001
netstat -ano | findstr :3001

# Kill the process
taskkill /PID <process_id> /F
```

---

## 📝 Environment Variables

Make sure your `.env` file has:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/yathrago?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/yathrago?schema=public"
PORT=3001
```

---

## 🎯 Next Steps

1. ✅ Verify all endpoints work
2. ✅ Test with real data
3. ✅ Update frontend to consume APIs
4. ✅ Add authentication guards
5. ✅ Deploy to staging

---

## 📚 Documentation

- **Backend Implementation:** See `BACKEND_IMPLEMENTATION_COMPLETE.md`
- **Schema Changes:** See `SCHEMA_UPDATE_GUIDE.md`
- **Team Merge Strategy:** See `TEAM_MERGE_STRATEGY.md`
- **API Reference:** Coming soon in Swagger docs

---

**Ready to test!** 🚀

Run the commands above and verify all endpoints are working.
