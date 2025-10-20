# Schema Update Guide - October 20, 2025

## ⚠️ Important: Schema Changes Made

### What Changed?

Three new models and six new enums were added to support Manager, Finance Manager, Driver Coordinator, and Owner dashboards with real data integration.

### New Models Added:

1. **VehicleAlert** - Track vehicle emergencies, breakdowns, maintenance alerts
2. **AuditLog** - Track admin/manager actions for compliance
3. **PaymentRefund** - Manage payment refunds and disputes

### New Enums Added:

1. **VehicleAlertType** - BREAKDOWN, ACCIDENT, MAINTENANCE, EMERGENCY, etc.
2. **AlertSeverity** - LOW, MEDIUM, HIGH, CRITICAL
3. **AlertStatus** - ACTIVE, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, CANCELLED
4. **RefundType** - FULL, PARTIAL, OVERPAYMENT, CANCELLATION, SERVICE_ISSUE
5. **RefundStatus** - PENDING, APPROVED, REJECTED, PROCESSING, COMPLETED, FAILED

---

## 🔄 How to Update Your Local Branch

### Step 1: Pull Latest Changes

```powershell
git pull origin main
# Or if you're merging from a feature branch:
git merge origin/feature-branch-name
```

### Step 2: Regenerate Prisma Client

```powershell
cd backend
npx prisma generate
```

This will update TypeScript types and Prisma client methods.

### Step 3: Apply Database Migrations

```powershell
# For development database:
npx prisma migrate dev

# For production (after testing):
npx prisma migrate deploy
```

### Step 4: Restart Your Backend Server

```powershell
npm run start:dev
```

---

## ✅ Verification Steps

After updating, verify everything works:

```powershell
# Check Prisma client generated successfully
npx prisma validate

# Check database is in sync
npx prisma migrate status

# Run backend to ensure no errors
npm run start:dev
```

---

## 🚨 Potential Conflicts

### If you're working on a branch that also modifies schema:

1. **Enum conflicts**: If you added same enum with different values
   - **Solution**: Manually merge enum values
   
2. **Migration conflicts**: Different migration timestamps
   - **Solution**: Reset migrations locally:
     ```powershell
     npx prisma migrate reset
     npx prisma migrate dev
     ```

3. **Model conflicts**: If you added similar models
   - **Solution**: Consolidate models or rename to avoid duplication

---

## 📝 Breaking Changes

**NONE** - This update is fully backward compatible:
- ✅ No existing models modified
- ✅ No existing enums modified
- ✅ Only new tables added
- ✅ Existing queries/mutations unaffected

---

## 🆘 Troubleshooting

### Error: "Prisma schema validation failed"
```powershell
npx prisma format
npx prisma validate
```

### Error: "Migration failed"
```powershell
# Reset migrations (DEV ONLY - will clear data)
npx prisma migrate reset

# Or manually fix in database
npx prisma studio
```

### Error: "Type errors in TypeScript"
```powershell
# Regenerate Prisma client
npx prisma generate

# Restart TypeScript server in VS Code
# Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

---

## 📞 Questions?

Contact: [Your Name/Team Lead]
Slack: #yathrago-dev
