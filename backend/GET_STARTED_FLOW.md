# YathraGo Mobile Authentication Guide

## Overview

This is the **unified "Get Started" authentication system** for YathraGo's mobile applications. It provides a seamless single-button authentication experience that automatically handles both new user registration and existing user login without requiring users to choose between "Sign Up" or "Log In".

## How It Works

1. **User taps "Get Started"**
2. **Enters phone number** → System checks if user exists
3. **Receives OTP** → Same flow for both new and existing users
4. **Enters OTP** → System returns JWT + user info
5. **App navigates based on `isNewUser` flag**

## Available Endpoints

The authentication system provides three sets of endpoints:

### App-Specific Endpoints (Recommended)
- **Customer App**: `/customer/auth/get-started/*`
- **Driver App**: `/driver/auth/get-started/*`

### Generic Endpoints
- **Universal**: `/auth/get-started/*` (requires `userType` in body)

All endpoints follow the same pattern:
- `/send-otp` - Sends OTP and returns `isNewUser` flag
- `/verify-otp` - Verifies OTP and returns JWT + user info

## API Endpoints

### Customer App

#### 1. Send OTP (Get Started)
```http
POST /customer/auth/get-started/send-otp
Content-Type: application/json

{
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully. Please check your phone.",
  "isNewUser": true
}
```

#### 2. Verify OTP (Get Started)
```http
POST /customer/auth/get-started/verify-otp
Content-Type: application/json

{
  "phone": "+1234567890",
  "otp": "123456"
}
```

**Response:**
```json
{
  "accessToken": "jwt-token-here",
  "user": {
    "id": 123,
    "phone": "+1234567890",
    "userType": "CUSTOMER",
    "isVerified": true,
    "isNewUser": true
  }
}
```

### Driver App

#### 1. Send OTP (Get Started)
```http
POST /driver/auth/get-started/send-otp
Content-Type: application/json

{
  "phone": "+1234567890"
}
```

#### 2. Verify OTP (Get Started)
```http
POST /driver/auth/get-started/verify-otp
Content-Type: application/json

{
  "phone": "+1234567890",
  "otp": "123456"
}
```

**Response:** Same format as Customer app response, but with `"userType": "DRIVER"`

### Generic Auth Endpoints

For testing or when you need to specify the user type dynamically:

#### 1. Send OTP (Generic)
```http
POST /auth/get-started/send-otp
Content-Type: application/json

{
  "phone": "+1234567890",
  "userType": "CUSTOMER"
}
```

#### 2. Verify OTP (Generic)
```http
POST /auth/get-started/verify-otp
Content-Type: application/json

{
  "phone": "+1234567890",
  "otp": "123456",
  "userType": "CUSTOMER"
}
```

## Mobile App Integration

### React Native Example

```javascript
// Get Started Flow
class AuthService {
  async startAuthentication(phone) {
    const response = await fetch('/customer/auth/get-started/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    
    const result = await response.json();
    
    // Store isNewUser flag for later navigation
    this.isNewUser = result.isNewUser;
    
    return result;
  }

  async verifyAndAuthenticate(phone, otp) {
    const response = await fetch('/customer/auth/get-started/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    
    const result = await response.json();
    
    // Store token for authenticated requests
    await AsyncStorage.setItem('token', result.accessToken);
    
    return result;
  }
}

// In your component
const handleGetStarted = async () => {
  try {
    // Step 1: Send OTP
    const otpResult = await authService.startAuthentication(phoneNumber);
    
    // Navigate to OTP screen
    navigation.navigate('OTPScreen', { 
      phone: phoneNumber, 
      isNewUser: otpResult.isNewUser 
    });
  } catch (error) {
    // Handle error
  }
};

const handleOTPVerification = async () => {
  try {
    // Step 2: Verify OTP
    const authResult = await authService.verifyAndAuthenticate(phone, otp);
    
    // Navigate based on user status
    if (authResult.user.isNewUser) {
      // New user - go to profile creation
      navigation.navigate('ProfileSetup');
    } else {
      // Existing user - go to main app
      navigation.navigate('MainTabs');
    }
  } catch (error) {
    // Handle error
  }
};
```

### Flutter Example

```dart
class AuthService {
  static const String baseUrl = 'http://localhost:3000';
  
  Future<Map<String, dynamic>> startAuthentication(String phone) async {
    final response = await http.post(
      Uri.parse('$baseUrl/customer/auth/get-started/send-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone}),
    );
    
    return jsonDecode(response.body);
  }
  
  Future<Map<String, dynamic>> verifyAndAuthenticate(String phone, String otp) async {
    final response = await http.post(
      Uri.parse('$baseUrl/customer/auth/get-started/verify-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone, 'otp': otp}),
    );
    
    return jsonDecode(response.body);
  }
}

// In your widget
Future<void> _handleGetStarted() async {
  try {
    final result = await authService.startAuthentication(_phoneController.text);
    
    // Navigate to OTP screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => OTPScreen(
          phone: _phoneController.text,
          isNewUser: result['isNewUser'],
        ),
      ),
    );
  } catch (e) {
    // Handle error
  }
}
```

## User Experience Flow

### New User Journey
1. **Opens app** → Sees "Get Started" button
2. **Taps "Get Started"** → Phone number input screen
3. **Enters phone** → `isNewUser: true` returned
4. **Enters OTP** → Account created, JWT token received
5. **Redirected to profile setup** → Complete profile information

### Existing User Journey
1. **Opens app** → Sees "Get Started" button
2. **Taps "Get Started"** → Phone number input screen
3. **Enters phone** → `isNewUser: false` returned
4. **Enters OTP** → Authenticated, JWT token received
5. **Redirected to main app** → Skip profile setup

## Response Fields

### Send OTP Response
- `message`: Success message
- `isNewUser`: Boolean indicating if this is a new user

### Verify OTP Response
- `accessToken`: JWT token for authenticated requests
- `user`: User information object
  - `id`: User ID
  - `phone`: User's phone number
  - `userType`: "CUSTOMER" or "DRIVER"
  - `isVerified`: Boolean (always true after OTP verification)
  - `isNewUser`: Boolean for navigation logic

## Backend Logic

The unified system:

1. **Checks user existence** when sending OTP
2. **Uses appropriate OTP purpose**:
   - `PHONE_VERIFICATION` for new users
   - `LOGIN` for existing users
3. **Creates account if new user** during verification
4. **Returns consistent response** regardless of user status
5. **Provides `isNewUser` flag** for frontend navigation

## Security Features

🔐 **Secure OTP Storage**: OTPs are hashed using Argon2 before database storage  
🛡️ **Rate Limiting**: 1-minute cooldown between OTP requests  
🕒 **Time-Limited**: OTPs expire after 10 minutes  
🚫 **Attempt Protection**: Maximum 3 failed verification attempts  
📊 **Security Monitoring**: Failed attempts are logged and tracked  

## Error Handling

### Common Errors
- Invalid phone number format
- OTP expired or invalid
- Too many OTP attempts
- Network/server errors

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Invalid OTP code",
  "error": "Bad Request"
}
```

## Testing

### Using Dummy SMS Provider (Recommended for Development)

1. **Set SMS_PROVIDER="dummy"** in your `.env` file
2. **Send OTP Request** to any endpoint
3. **Check console logs** for the OTP code:
   ```
   [DummySmsGateway] 📱 SMS to +1234567890: Your YathraGo verification code is: 123456...
   [DummySmsGateway] 🔢 OTP Code: 123456
   ```
4. **Use the logged OTP** in verification request
5. **Check `isNewUser` flag** in response

### Using Twilio SMS Provider (Production)

**⚠️ Twilio Trial Account Limitations:**
- Can only send SMS to verified phone numbers
- Must verify numbers at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
- All messages include trial account prefix

**For Production:**
1. **Set SMS_PROVIDER="twilio"** in your `.env` file
2. **Add Twilio credentials** (Account SID, Auth Token, From Number)
3. **Verify recipient numbers** (for trial accounts) or upgrade to paid plan
4. **Test with verified numbers** only

### Example Test Flow

```bash
# Test new customer user
curl -X POST http://localhost:3000/customer/auth/get-started/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'

# Check console for OTP, then verify
curl -X POST http://localhost:3000/customer/auth/get-started/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "otp": "123456"}'

# Test driver user
curl -X POST http://localhost:3000/driver/auth/get-started/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1987654321"}'

# Using generic auth endpoint with userType
curl -X POST http://localhost:3000/auth/get-started/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "userType": "CUSTOMER"}'
```

## Generic Auth Endpoints

For testing or generic authentication, you can also use the base auth endpoints:

- `POST /auth/get-started/send-otp`
- `POST /auth/get-started/verify-otp`

These endpoints require the `userType` field in the request body to specify whether the user is a "CUSTOMER" or "DRIVER".

## Key Benefits

✅ **Simplified UX**: Single "Get Started" button eliminates user confusion  
✅ **Automatic Detection**: System determines if user is new or returning  
✅ **Consistent Flow**: Same 3-step process for all users (phone → OTP → app)  
✅ **Smart Navigation**: Frontend gets clear direction with `isNewUser` flag  
✅ **Faster Onboarding**: Reduced friction leads to better conversion rates  
✅ **Error-Proof Design**: No more "wrong button" authentication errors  
✅ **Dual App Support**: Separate endpoints for Customer and Driver apps  
✅ **Secure**: Phone number verification with time-limited OTP codes

## Quick Start

**For Mobile Developers:**
1. Use app-specific endpoints: `/customer/auth/get-started/*` or `/driver/auth/get-started/*`
2. Send OTP, get `isNewUser` flag
3. Verify OTP, get JWT token + user info
4. Navigate based on `isNewUser`: profile setup or main app

**For Testing:**
1. Use generic endpoints: `/auth/get-started/*` with `userType` field
2. Check console logs for OTP codes when using Dummy SMS provider
