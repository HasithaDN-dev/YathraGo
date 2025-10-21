# 🔧 YathraGo Payment System - Complete Troubleshooting Guide

## ❌ COMMON ERRORS & SOLUTIONS

### 1. "Failed to create payment intent"

**Symptoms:**
- Error appears when clicking "Pay Now" button
- Console shows: "Card payment error: Error: Failed to create payment intent"

**Root Causes:**
1. ❌ Backend server is not running
2. ❌ Backend crashed due to compilation errors
3. ❌ Network connection issue
4. ❌ Stripe service not configured properly

**Solutions:**

#### ✅ Solution A: Start Backend Server
```powershell
cd "c:\Group project\YathraGo\backend"
npm run start:dev
```

**Verify backend is running:**
- Should see: "Nest application successfully started"
- Should listen on: http://localhost:3000
- Check: http://localhost:3000 in browser (should return "Hello World!")

#### ✅ Solution B: Check Backend Logs
If backend crashes immediately:
```powershell
cd "c:\Group project\YathraGo\backend"
npm run build
```
Fix any TypeScript compilation errors shown.

#### ✅ Solution C: Verify Stripe Configuration
Check `backend/.env` file has:
```
STRIPE_SECRET_KEY="sk_test_51SKJ..."
STRIPE_PUBLISHABLE_KEY="pk_test_51SKJ..."
```

---

### 2. "Failed to fetch Stripe key"

**Symptoms:**
- Error on app startup
- Console shows: "Failed to fetch Stripe key"

**Root Cause:**
- Trying to fetch Stripe publishable key before backend is ready

**Solution:**
✅ **Already Fixed** - App now waits 1 second and handles errors gracefully

---

### 3. "Cannot connect to server"

**Symptoms:**
- All API calls fail
- Network errors in console

**Solutions:**

#### ✅ Check Backend URL
Verify `mobile-customer/.env` has:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

#### ✅ Check Network
- Backend and mobile app must be on same network
- Or use ngrok to expose backend:
```powershell
ngrok http 3000
```
Then update EXPO_PUBLIC_API_URL to ngrok URL.

---

### 4. Backend Compilation Errors

**Symptoms:**
- Backend won't start
- Shows TypeScript errors

**Common Issues:**

#### Issue: Missing Stripe package
```powershell
cd "c:\Group project\YathraGo\backend"
npm install stripe
npm install --save-dev @types/stripe
```

#### Issue: Line ending problems
Run ESLint fix:
```powershell
npm run lint -- --fix
```

---

## 🎯 PRE-FLIGHT CHECKLIST

Before testing card payments:

### Backend:
- [ ] Backend server is running (npm run start:dev)
- [ ] No compilation errors
- [ ] Stripe keys configured in .env
- [ ] Server responds at http://localhost:3000

### Frontend:
- [ ] Mobile app is running (npm run start)
- [ ] Correct API_URL in .env
- [ ] User is logged in
- [ ] Child has assigned driver with amount

### Payment Data:
- [ ] Child has payment records (or will be auto-created)
- [ ] Payment records have valid amounts
- [ ] Payment status allows selection (NOT_DUE, PENDING, OVERDUE)

---

## 🔍 DEBUGGING STEPS

### Step 1: Verify Backend Health
```powershell
# In PowerShell:
Invoke-WebRequest -Uri http://localhost:3000
```
Should return status 200.

### Step 2: Test Stripe Endpoint
```powershell
Invoke-WebRequest -Uri http://localhost:3000/stripe/publishable-key
```
Should return: `{"publishableKey":"pk_test_..."}`

### Step 3: Check Backend Logs
Look for these messages:
- ✅ "Stripe service initialized successfully"
- ✅ "Nest application successfully started"
- ❌ Any errors related to Stripe or database

### Step 4: Test Payment Flow
1. Open mobile app
2. Navigate to Payment screen
3. Select Card Payment tab
4. Select months to pay
5. Tap "Proceed to Card Payment"
6. Check browser network tab / backend logs

---

## 📱 UPDATED ERROR HANDLING

### What Was Changed:

#### 1. Card Payment Screen (`card-payment.tsx`)
- ✅ Added backend health check before payment
- ✅ Better error messages for network issues
- ✅ Specific alerts for different error types

#### 2. Stripe API (`stripe.api.ts`)
- ✅ Added try-catch for network errors
- ✅ Better error context
- ✅ Clearer error messages

#### 3. Backend Health Utility (`backend-health.ts`)
- ✅ New utility to check if backend is reachable
- ✅ 3-second timeout for quick response
- ✅ Used before critical operations

---

## 🚀 PAYMENT FLOW DIAGRAM

```
User Selects Months
  ↓
Taps "Proceed to Card Payment"
  ↓
Navigate to card-payment.tsx
  ↓
User Enters Card Details
  ↓
Taps "Pay Now"
  ↓
🆕 CHECK: Is backend healthy?
  ├─ NO → Show "Server Unavailable" alert ❌
  └─ YES → Continue ✅
  ↓
POST /stripe/create-payment-intent
  ├─ Network Error → Show "Cannot connect" ❌
  ├─ 400/500 Error → Show "Failed to initialize" ❌
  └─ 200 OK → Continue ✅
  ↓
Initialize Stripe Payment Sheet
  ↓
Present Card Input
  ↓
User Confirms Payment
  ↓
Stripe Processes Payment
  ├─ User Cancels → Silent exit
  ├─ Payment Fails → Show error ❌
  └─ Success ✅
  ↓
POST /stripe/confirm-payment
  ↓
Update Database (status → PAID)
  ↓
Show Success Alert
  ↓
Navigate Back to Payment Screen
```

---

## 💡 PREVENTION TIPS

### 1. Always Start Backend First
```powershell
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Mobile App  
cd mobile-customer
npm run start
```

### 2. Check Backend Status
Add this to your terminal:
```powershell
# Quick backend health check:
curl http://localhost:3000
```

### 3. Monitor Backend Logs
Keep backend terminal visible to see:
- API requests coming in
- Stripe operations
- Any errors

### 4. Test Payments in Order
1. First test: Physical payment (simpler, no Stripe)
2. Then test: Card payment (complex, uses Stripe)
3. Check database after each payment

---

## 📊 ERROR PRIORITY LEVELS

### 🔴 CRITICAL (App Breaks):
1. Backend not running
2. Database connection failed
3. Stripe keys missing

### 🟡 WARNING (Feature Breaks):
1. Network connection issues
2. Invalid payment data
3. Stripe API errors

### 🟢 INFO (Graceful Degradation):
1. Stripe key fetch delayed
2. Empty payment records (auto-created now)
3. User cancels payment

---

## 🛠️ FIXES IMPLEMENTED

### Fix 1: Backend Health Check
**Before:** App crashes with unclear error  
**After:** Shows "Server Unavailable" alert

### Fix 2: Better Error Messages
**Before:** Generic "Payment failed"  
**After:** Specific error (network, payment intent, card declined)

### Fix 3: Network Error Handling
**Before:** Raw fetch error  
**After:** "Cannot connect to payment server"

### Fix 4: Pre-Flight Validation
**Before:** Try payment, then fail  
**After:** Check backend first, warn user

---

## ✅ FINAL CHECKLIST

Before reporting any error:
1. [ ] Backend is running (check terminal)
2. [ ] No errors in backend logs
3. [ ] Stripe keys are configured
4. [ ] Mobile app can reach backend
5. [ ] User has payment records
6. [ ] Test card: 4242 4242 4242 4242

If all checked and still fails:
1. Share backend logs
2. Share mobile console logs
3. Share network tab (browser dev tools)
4. Specify exact step where it fails

---

**ALL ERRORS ARE NOW HANDLED GRACEFULLY WITH CLEAR USER FEEDBACK! 🎉**
