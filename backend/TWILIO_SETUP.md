# Twilio SMS Configuration Guide

## Overview

This guide helps you configure Twilio SMS for the YathraGo authentication system.

## Twilio Account Types

### 🆓 **Trial Account** (Current)
- **Free** with limited features
- Can only send SMS to **verified phone numbers**
- Messages include trial account prefix
- Perfect for **development and testing**

### 💳 **Paid Account**
- Send SMS to any phone number
- No message prefixes
- Higher rate limits
- Required for **production use**

## Setup Steps

### 1. Get Twilio Credentials

Your current credentials (from `.env` file):
```bash
TWILIO_ACCOUNT_SID="ACf1e3bca2895da29733168b6085ad05b2"
TWILIO_AUTH_TOKEN="ff7f4b91657eba88e84146e223824747"  
TWILIO_FROM_NUMBER="+16313647796"
```

### 2. Verify Your Phone Number (Trial Account)

**To test with your number `+94779450704`:**

1. **Go to Twilio Console**: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. **Click "Add a verified number"**
3. **Enter your number**: `+94779450704`
4. **Complete verification** (you'll receive an SMS with verification code)
5. **Confirm verification** in Twilio console

### 3. Test Configuration

Once your number is verified:

```bash
# Update .env file
SMS_PROVIDER="twilio"

# Test the endpoint
curl -X POST http://localhost:3000/customer/auth/get-started/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+94779450704"}'
```

You should receive an actual SMS on your phone!

## Error Codes & Solutions

### Error 21608: "Unverified Number"
```
The number +9477945XXXX is unverified. Trial accounts cannot send messages to unverified numbers
```

**Solution**: Verify your phone number in Twilio console (see step 2 above)

### Error 20003: "Authentication Error"
```
Authenticate
```

**Solution**: Check your `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in `.env`

### Error 21614: "Invalid From Number"
```
'From' number is not a valid phone number, shortcode, or alphanumeric sender ID
```

**Solution**: Check your `TWILIO_FROM_NUMBER` in `.env`

## Development vs Production

### 🔧 **Development (Recommended)**
```bash
# Use dummy provider for development
SMS_PROVIDER="dummy"
```
- No costs or limitations
- OTP codes logged to console
- Fast and reliable testing

### 🚀 **Production**
```bash
# Use Twilio for production
SMS_PROVIDER="twilio"
```
- Real SMS delivery
- Requires verified numbers (trial) or paid account
- Better user experience

## Trial Account Limitations

| Feature | Trial Account | Paid Account |
|---------|---------------|--------------|
| Send to any number | ❌ No | ✅ Yes |
| Verified numbers only | ✅ Yes | ❌ No |
| Message prefix | ✅ Yes ("Sent from your Twilio trial account") | ❌ No |
| Rate limits | Lower | Higher |
| Monthly free credits | $15.50 | Variable |

## Upgrading to Paid Account

When ready for production:

1. **Go to Twilio Console**: https://console.twilio.com/
2. **Navigate to Billing**: Click "Billing" in the left sidebar
3. **Add payment method**: Add credit card
4. **Purchase phone number**: Buy a dedicated number for sending SMS
5. **Update FROM_NUMBER**: Use your purchased number

## Testing Checklist

### ✅ **Trial Account Testing**
- [ ] Phone number verified in Twilio console
- [ ] SMS_PROVIDER set to "twilio"
- [ ] Test with verified number only
- [ ] Check for trial prefix in received SMS

### ✅ **Paid Account Testing**  
- [ ] Payment method added
- [ ] Dedicated phone number purchased
- [ ] Test with any phone number
- [ ] No trial prefix in SMS

## Security Best Practices

🔐 **Environment Variables**: Never commit Twilio credentials to git
🔑 **Token Rotation**: Regularly rotate your Auth Token
📱 **Phone Validation**: Validate phone number format before sending
🚫 **Rate Limiting**: Implement rate limiting for OTP requests (already done)

## Support Resources

- **Twilio Documentation**: https://www.twilio.com/docs/sms
- **Error Code Reference**: https://www.twilio.com/docs/api/errors
- **Trial Account Guide**: https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account
