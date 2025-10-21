# Stripe Webhook Setup Guide - Complete Real-World Integration

## 🎯 Goal
Set up Stripe webhooks so payments are automatically marked as PAID without driver confirmation.

## 📋 Prerequisites
- Stripe account (you already have test keys)
- Backend running on a public URL or using ngrok for local testing

---

## Option 1: Local Testing with ngrok (Recommended for Development)

### Step 1: Install ngrok
Download from: https://ngrok.com/download

### Step 2: Start your backend
```bash
cd backend
npm run start:dev
```
Backend should be running on `http://localhost:3000`

### Step 3: Start ngrok tunnel
```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding    https://abcd-1234-5678.ngrok-free.app -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://abcd-1234-5678.ngrok-free.app`)

### Step 4: Configure Stripe Webhook

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/webhooks

2. **Click "Add endpoint"**

3. **Enter Endpoint URL**:
   ```
   https://YOUR-NGROK-URL.ngrok-free.app/stripe/webhook
   ```
   Example: `https://abcd-1234-5678.ngrok-free.app/stripe/webhook`

4. **Select Events to Listen To**:
   - Click "Select events"
   - Check these events:
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
     - ✅ `payment_intent.canceled`

5. **Click "Add endpoint"**

6. **Copy the Webhook Signing Secret**:
   - After creating, click on the webhook
   - Find "Signing secret" (starts with `whsec_...`)
   - Click "Reveal" and copy it

7. **Update your `.env` file**:
   ```properties
   STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxx"
   ```

8. **Restart backend**:
   ```bash
   # Stop backend (Ctrl+C)
   npm run start:dev
   ```

---

## Option 2: Production/Deployed Backend

If your backend is deployed (e.g., on Heroku, AWS, etc.):

1. **Go to**: https://dashboard.stripe.com/test/webhooks
2. **Click "Add endpoint"**
3. **Enter URL**: `https://your-production-domain.com/stripe/webhook`
4. **Select events**: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
5. **Copy webhook secret** and add to `.env`

---

## Testing the Webhook

### Step 1: Make a test payment
1. Open mobile app
2. Select a month
3. Pay with test card: `4242 4242 4242 4242`

### Step 2: Check Stripe Dashboard
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. You should see webhook events being sent
4. Check if they show "Success" (green checkmark)

### Step 3: Check Backend Logs
You should see:
```
[Nest] LOG [StripeService] Webhook received: payment_intent.succeeded
[Nest] LOG [StripeService] Payment succeeded: pi_xxxxx
[Nest] LOG [StripeService] Updated 2 payment records to PAID
```

### Step 4: Check Database
Payment records should have:
- `paymentStatus`: `PAID`
- `amountPaid`: amount paid
- `paymentDate`: current date

---

## Troubleshooting

### Webhook shows "Timeout" or "Failed"
- **Check**: Is backend running?
- **Check**: Is ngrok tunnel active?
- **Solution**: Restart backend and ngrok

### Backend shows "Webhook signature verification failed"
- **Check**: Is `STRIPE_WEBHOOK_SECRET` correct?
- **Solution**: Copy secret again from Stripe dashboard

### Payment succeeds but not marked as PAID
- **Check**: Backend logs for webhook events
- **Check**: Stripe dashboard webhook events
- **Solution**: Webhook might not be configured correctly

---

## Production Deployment Checklist

When moving to production:

1. ✅ Change Stripe keys from test to live:
   ```properties
   STRIPE_SECRET_KEY="sk_live_xxxxx"  # Live secret key
   STRIPE_PUBLISHABLE_KEY="pk_live_xxxxx"  # Live publishable key
   ```

2. ✅ Update webhook endpoint to production URL

3. ✅ Get live webhook secret from production webhook

4. ✅ Test with real card (small amount first!)

5. ✅ Monitor Stripe dashboard for live events

---

## Security Notes

- ✅ Webhook secret validates requests are from Stripe
- ✅ Never expose webhook secret publicly
- ✅ Backend verifies signature before processing
- ✅ Failed verifications are logged and rejected

---

*Setup completed! Your Stripe integration will now automatically mark payments as PAID.*
