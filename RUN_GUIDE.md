# YathraGo - How to Run the Complete Application

## Prerequisites

Before running the applications, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm**

## 🗃️ Database Setup

1. **Install PostgreSQL** and create a database
2. **Set up your environment variables** in the backend:
   ```bash
   cd backend
   cp .env.example .env  # Create your .env file
   ```
3. **Configure your `.env` file** with database connection:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/yathrago"
   JWT_SECRET="your-jwt-secret-key"
   JWT_EXPIRES_IN="7d"
   NODE_ENV="development"
   PORT=3000
   
   # SMS Gateway Configuration (Optional - for OTP)
   TWILIO_ACCOUNT_SID="your-twilio-account-sid"
   TWILIO_AUTH_TOKEN="your-twilio-auth-token"
   TWILIO_PHONE_NUMBER="your-twilio-phone-number"
   ```
4. **Run database migrations**:
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

## 📱 Mobile App Environment Setup

### Find Your Computer's IP Address

For mobile apps to connect to your backend, you need your computer's IP address:

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
```
Look for `inet` address under your network interface (e.g., `192.168.1.100`)

### Configure Mobile App Environment Files

#### Customer App Configuration
```bash
cd mobile-customer
cp .env.example .env
```

Edit `mobile-customer/.env`:
```env
# Replace YOUR_IP_ADDRESS with your computer's actual IP
# Example: EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3000
```

#### Driver App Configuration
```bash
cd mobile-driver
cp .env.example .env
```

Edit `mobile-driver/.env`:
```env
# Replace YOUR_IP_ADDRESS with your computer's actual IP  
# Example: EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3000
```

**Important Notes:**
- ⚠️ **Do NOT use `localhost`** in mobile app .env files - mobile devices can't access your computer's localhost
- ✅ **Use your actual IP address** (e.g., `192.168.1.100`)
- 📱 **Phone and computer must be on the same WiFi network**
- 🔄 **Restart mobile apps** after changing .env files

## 🚀 Running the Applications

### Step 1: Start the Backend API Server

```bash
# Navigate to backend directory
cd backend

# Install dependencies (first time only)
npm install

# Start the development server
npm run start:dev
```

The backend will run on: **http://localhost:3000**

### Step 2: Start the Customer Mobile App

Open a **new terminal window**:

```bash
# Navigate to customer app directory
cd mobile-customer

# Install dependencies (first time only)
npm install

# Start the Expo development server
npx expo start --port 8081
```

The customer app will run on: **http://localhost:8081**
**Mobile app will connect to**: `http://YOUR_IP_ADDRESS:3000` (from .env file)

### Step 3: Start the Driver Mobile App

Open **another new terminal window**:

```bash
# Navigate to driver app directory
cd mobile-driver

# Install dependencies (first time only)
npm install

# Start the Expo development server
npx expo start --port 8082
```

The driver app will run on: **http://localhost:8082**
**Mobile app will connect to**: `http://YOUR_IP_ADDRESS:3000` (from .env file)

## 📱 Running on Devices/Emulators

### Option 1: Expo Go App (Recommended for Testing)

1. **Install Expo Go** on your Android/iOS device
2. **Scan the QR code** from the terminal/browser
3. **Test the authentication flow**

### Option 2: Android Emulator

```bash
# For Customer App
cd mobile-customer
npm run android

# For Driver App  
cd mobile-driver
npm run android
```

### Option 3: iOS Simulator (macOS only)

```bash
# For Customer App
cd mobile-customer
npm run ios

# For Driver App
cd mobile-driver
npm run ios
```

## 🧪 Testing the Authentication

### 1. Backend API Testing (Postman/curl)

**Send OTP (Customer):**
```bash
curl -X POST http://localhost:3000/auth/customer/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+94712345678"}'
```

**Verify OTP (Customer):**
```bash
curl -X POST http://localhost:3000/auth/customer/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+94712345678", "otp": "123456"}'
```

**Send OTP (Driver):**
```bash
curl -X POST http://localhost:3000/auth/driver/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+94712345678"}'
```

### 2. Mobile App Testing

1. **Open the mobile app** (Customer or Driver)
2. **Enter a Sri Lankan phone number** (format: +94XXXXXXXXX)
3. **Check the backend console** for the OTP code (when using dummy SMS provider)
4. **Enter the OTP** in the mobile app
5. **Verify successful authentication** and navigation

## 🔧 Troubleshooting

### Backend Issues

**Database Connection Error:**
```bash
# Check if PostgreSQL is running
# Verify DATABASE_URL in .env file
# Run migrations again
npx prisma migrate reset
npx prisma migrate dev
```

**Port Already in Use:**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use a different port
npm run start:dev -- --port 3001
```

### Mobile App Issues

**Metro bundler issues:**
```bash
# Clear cache and restart
npm run start:clear
```

**Expo CLI not found:**
```bash
# Install Expo CLI globally
npm install -g @expo/cli
```

**API Connection Issues:**
- ✅ Check that backend is running on http://localhost:3000
- ✅ Verify mobile app `.env` files have your computer's IP address (NOT localhost)
- ✅ Ensure phone and computer are on the same WiFi network  
- ✅ Check Windows Firewall isn't blocking port 3000
- ✅ Restart mobile apps after changing .env files

**Network Request Failed:**
```bash
# 1. Verify your IP address
ipconfig  # Windows
ifconfig  # Mac/Linux

# 2. Update mobile app .env files with correct IP
# mobile-customer/.env and mobile-driver/.env should have:
# EXPO_PUBLIC_API_URL=http://YOUR_ACTUAL_IP:3000

# 3. Restart the mobile apps
npx expo start --clear --port 8081  # Customer app
npx expo start --clear --port 8082  # Driver app
```

### Common Issues

**CORS Errors:**
- The backend should have CORS enabled for localhost
- Check if frontend and backend are running on correct ports

**Environment Variables:**
- Make sure `.env` files are properly configured
- Restart the development servers after changing environment variables

## 📱 App URLs Summary

- **Backend API**: http://localhost:3000
- **Customer App**: http://localhost:8081  
- **Driver App**: http://localhost:8082

## 🎯 Authentication Endpoints

### Customer App Endpoints:
- `POST /auth/customer/send-otp`
- `POST /auth/customer/verify-otp`
- `POST /auth/customer/validate-token`
- `POST /auth/customer/refresh-token`
- `POST /auth/customer/logout`

### Driver App Endpoints:
- `POST /auth/driver/send-otp`
- `POST /auth/driver/verify-otp`
- `POST /auth/driver/validate-token`
- `POST /auth/driver/refresh-token`
- `POST /auth/driver/logout`

## 📋 Quick Start Commands

**First-time setup:**
```bash
# 1. Setup backend environment
cd backend
cp .env.example .env
# Edit backend/.env with your database URL and JWT secret

# 2. Setup mobile apps environment  
cd ../mobile-customer
cp .env.example .env
# Edit mobile-customer/.env with: EXPO_PUBLIC_API_URL=http://YOUR_IP:3000

cd ../mobile-driver  
cp .env.example .env
# Edit mobile-driver/.env with: EXPO_PUBLIC_API_URL=http://YOUR_IP:3000

# 3. Install dependencies and run migrations
cd ../backend
npm install
npx prisma migrate dev
npx prisma generate
```

**Start everything at once** (use multiple terminals):

```bash
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Customer App  
cd mobile-customer && npx expo start --port 8081

# Terminal 3: Driver App
cd mobile-driver && npx expo start --port 8082
```

## 🔍 Logs and Debugging

- **Backend logs**: Check the terminal running the backend server
- **Mobile app logs**: Check the Expo development tools or device console
- **API requests**: Monitor network requests in the mobile app debugger
- **Database**: Use `npx prisma studio` to view/edit database records

## 🏁 Success Indicators

When everything is running correctly, you should see:

1. ✅ Backend server started on port 3000
2. ✅ Customer app Metro bundler on port 8081
3. ✅ Driver app Metro bundler on port 8082
4. ✅ QR codes displayed for mobile app scanning
5. ✅ Database connected and migrations applied
6. ✅ Authentication flow working end-to-end
