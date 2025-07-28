# 🚗 Driver Authentication Flow Documentation

## **Overview**

The mobile-driver app has been **completely converted** to use a simplified Zustand-based authentication flow with separated vehicle API calls. Since drivers don't need profile switching like customers, we use a much simpler and more logical store structure.

## **🔄 Key Differences from Customer App**

### **1. No Profile Switching**
- **Customer App**: Multiple child/staff profiles with switching capability
- **Driver App**: Single driver profile, no switching needed

### **2. Simplified Store Structure**
- **Customer App**: Separate stores for auth, profile, and registration
- **Driver App**: **Only 3 stores** - auth, driver, and vehicle (consolidated)

### **3. Driver-Specific Registration Flow**
- **Customer App**: OTP → Customer Profile → Child/Staff Profiles
- **Driver App**: OTP → Driver Registration → Vehicle Registration

### **4. Separated Vehicle APIs**
- **Customer App**: All APIs in single files
- **Driver App**: Vehicle APIs separated into dedicated `vehicle.api.ts`

## **📋 Registration Status Flow**

```
OTP_PENDING → OTP_VERIFIED → ACCOUNT_CREATED
```

### **Status Meanings**
| Status | Description | Driver Action Required | Navigation |
|--------|-------------|----------------------|------------|
| `OTP_PENDING` | Phone entered, waiting for OTP | Enter OTP | Auth screens |
| `OTP_VERIFIED` | OTP verified, basic account created | Complete driver registration | Registration screens |
| `ACCOUNT_CREATED` | Driver registration completed | Use main app | Main app (tabs) |

## **🏗️ Simplified File Structure**

### **App Structure** (`app/`)
```
app/
├── _layout.tsx                    # Root layout with protected routes
├── onboarding.tsx                 # Initial onboarding screen
├── (auth)/                        # Authentication screens
│   ├── _layout.tsx
│   ├── phone-auth.tsx             # Phone number input
│   └── verify-otp.tsx             # OTP verification
├── (registration)/                # 🆕 Registration screens (separate folder)
│   ├── _layout.tsx
│   ├── reg-personal.tsx           # Personal information
│   ├── reg-verify.tsx             # ID verification
│   ├── reg-id.tsx                 # ID photo capture
│   ├── reg-uploadId.tsx           # ID document upload
│   ├── ownership.tsx              # Vehicle ownership
│   ├── vehicle-reg.tsx            # Vehicle information
│   ├── vehicle-doc.tsx            # Vehicle documents
│   └── success.tsx                # Registration success
├── (tabs)/                        # Main app screens
│   ├── _layout.tsx
│   ├── index.tsx                  # Home screen
│   ├── history.tsx                # Trip history
│   ├── menu.tsx                   # Menu/settings
│   └── notifications.tsx          # Notifications
├── profile/                       # Profile management
│   └── profile.tsx
└── vehicle-list/                  # Vehicle management
    └── page.tsx
```

### **Types** (`types/driver.types.ts`)
```typescript
export interface Driver {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  profileImageUrl?: string;
  emergencyContact?: string;
  status: string;
  registrationStatus: DriverRegistrationStatus;
  isProfileComplete?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DriverRegistrationStatus = 
  | 'OTP_PENDING'
  | 'OTP_VERIFIED'
  | 'ACCOUNT_CREATED';
```

### **Services** (`lib/services/token.service.ts`)
- **Secure token management** using Expo SecureStore
- **Token validation** and refresh capabilities
- **Authenticated fetch** helper for API calls

### **API Layer** (`lib/api/`)
- **`auth.api.ts`**: Authentication endpoints (OTP, login, logout)
- **`profile.api.ts`**: Driver profile and ID document management
- **`vehicle.api.ts`**: **NEW** - All vehicle-related API calls
- **`maps.api.ts`**: Maps integration (unchanged)

### **Stores** (`lib/stores/`) - **SIMPLIFIED**
- **`auth.store.ts`**: Authentication state management
- **`driver.store.ts`**: **NEW** - Consolidated driver profile and registration data
- **`vehicle.store.ts`**: **NEW** - Vehicle management

## **🔧 Implementation Details**

### **1. Auth Store (`auth.store.ts`)**
```typescript
interface AuthState {
  user: Driver | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isProfileComplete: boolean;
  isDriverRegistered: boolean;
  registrationStatus: string;
  hasHydrated: boolean;
  isLoading: boolean;
  // ... actions
}
```

**Key Features:**
- **Persistent storage** using Expo SecureStore
- **Registration status tracking**
- **Profile completion status**
- **Loading states** for better UX

### **2. Driver Store (`driver.store.ts`) - CONSOLIDATED**
```typescript
interface DriverState {
  // Driver profile data
  profile: Driver | null;
  
  // Registration form data
  personalInfo: PersonalInfo;
  idVerification: IdVerification;
  vehicleInfo: VehicleInfo;
  vehicleDocuments: VehicleDocuments;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Profile actions
  loadProfile: (token: string) => Promise<void>;
  updateProfile: (profile: Driver) => void;
  
  // Registration form actions
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateIdVerification: (verification: Partial<IdVerification>) => void;
  updateVehicleInfo: (info: Partial<VehicleInfo>) => void;
  updateVehicleDocuments: (documents: Partial<VehicleDocuments>) => void;
  resetRegistration: () => void;
  isRegistrationComplete: () => boolean;
  
  // Utility actions
  clearError: () => void;
}
```

**Key Features:**
- **Single store** for all driver-related data
- **Profile management** (no switching needed)
- **Registration form data** persistence
- **Form validation** and completion checking

### **3. Vehicle Store (`vehicle.store.ts`)**
```typescript
interface VehicleState {
  // Vehicle data
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  
  // Form data for adding/editing vehicles
  vehicleFormData: VehicleFormData;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  loadVehicles: (token: string) => Promise<void>;
  loadVehicleDetails: (token: string, vehicleId: string) => Promise<void>;
  selectVehicle: (vehicle: Vehicle | null) => void;
  
  // Form actions
  updateVehicleForm: (data: Partial<VehicleFormData>) => void;
  resetVehicleForm: () => void;
  setVehicleFormData: (data: VehicleFormData) => void;
  
  // Utility actions
  clearError: () => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (vehicleId: string, vehicle: Vehicle) => void;
  removeVehicle: (vehicleId: string) => void;
}
```

**Key Features:**
- **Separated vehicle concerns** from driver profile
- **Complete CRUD operations** for vehicles
- **Document upload** functionality
- **Type-safe** API calls

### **4. Root Layout (`app/_layout.tsx`)**
```typescript
// Protected routes - only accessible when authenticated and profile complete
<Stack.Protected guard={isLoggedIn && registrationStatus === 'ACCOUNT_CREATED'}>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="vehicle-list" options={{ headerShown: false }} />
  <Stack.Screen name="profile" options={{ headerShown: false }} />
</Stack.Protected>

// Registration routes - accessible when authenticated but not account created yet
<Stack.Protected guard={isLoggedIn}>
  <Stack.Screen name="(registration)" options={{ headerShown: false }} />
</Stack.Protected>

// Unauthenticated user routes
<Stack.Protected guard={!isLoggedIn}>
  <Stack.Screen name="onboarding" options={{ headerShown: false }} />
  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
</Stack.Protected>
```

## **🚀 Migration Benefits**

### **1. Simplicity**
- **Only 3 stores** instead of 4-5
- **Consolidated logic** for driver-specific needs
- **Easier to understand** and maintain
- **Clean folder structure** with separated registration screens

### **2. Performance**
- **Optimized font loading**
- **Efficient state management**
- **Reduced bundle size**

### **3. Maintainability**
- **Clean separation** of concerns
- **Type safety** with TypeScript
- **Easy debugging** with Zustand
- **Separated vehicle APIs** for better organization
- **Organized folder structure** for better code navigation

### **4. User Experience**
- **Smooth navigation** with protected routes
- **Persistent authentication**
- **Loading states** for better feedback
- **Form data persistence** across registration screens

## **📱 Navigation Flow**

### **New Driver Flow**
```
Onboarding → Phone Auth → OTP Verification → Driver Registration → Vehicle Registration → Main App
```

### **Returning Driver Flow**
```
App Launch → Check Auth → Load Profile → Main App (if complete) or Continue Registration
```

### **Navigation Logic**
- **`OTP_PENDING`** → Show auth screens (phone-auth, verify-otp)
- **`OTP_VERIFIED`** → Show registration screens (driver registration)
- **`ACCOUNT_CREATED`** → Show main app (tabs)

### **Protected Routes**
- **`(tabs)`**: Main app screens (only when `ACCOUNT_CREATED`)
- **`(registration)`**: Registration screens (when authenticated but not complete)
- **`(auth)`**: Authentication screens (when not authenticated)
- **`onboarding`**: Initial setup (when not authenticated)

### **Registration Screen Navigation**
```typescript
// Navigation within registration screens
router.push('/(registration)/reg-verify');
router.push('/(registration)/reg-id');
router.push({ pathname: '/(registration)/reg-uploadId', params: { side: 'front' } });
```

## **🔧 Usage Examples**

### **Using Auth Store**
```typescript
import { useAuthStore } from '../lib/stores/auth.store';

const { user, isLoggedIn, login, logout } = useAuthStore();
await login(accessToken, userData);
```

### **Using Driver Store**
```typescript
import { useDriverStore } from '../lib/stores/driver.store';

// Profile data
const { profile, loadProfile } = useDriverStore();
await loadProfile(token);

// Registration form data
const { personalInfo, updatePersonalInfo, isRegistrationComplete } = useDriverStore();
updatePersonalInfo({ firstName: 'John' });
```

### **Using Vehicle Store**
```typescript
import { useVehicleStore } from '../lib/stores/vehicle.store';

// Load vehicles
const { vehicles, loadVehicles } = useVehicleStore();
await loadVehicles(token);

// Add new vehicle
const { vehicleFormData, updateVehicleForm, addVehicle } = useVehicleStore();
updateVehicleForm({ vehicleType: 'Car' });
```

## **✅ Testing Checklist**

- [x] New driver registration flow
- [x] Returning driver login
- [x] Profile completion status
- [x] Vehicle registration integration
- [x] Protected route navigation
- [x] Error handling
- [x] Token persistence
- [x] Logout functionality
- [x] Form data persistence across screens
- [x] Vehicle API separation
- [x] Simplified store structure
- [x] Registration folder organization

## **🔄 Migration Summary**

### **✅ COMPLETED**:
- **Auth flow conversion** to Zustand stores
- **Token management** with SecureStore
- **Protected routes** implementation
- **All authentication screens** updated
- **Registration flow** converted to Zustand
- **Vehicle APIs separated** into dedicated file
- **All registration screens** updated
- **Old context and services** removed
- **Store consolidation** - simplified to 3 stores
- **Registration folder organization** - clean separation of concerns

### **🏗️ NEW ARCHITECTURE**:
- **3 Zustand stores**: `auth.store.ts`, `driver.store.ts`, `vehicle.store.ts`
- **3 API files**: `auth.api.ts`, `profile.api.ts`, `vehicle.api.ts`
- **Clean folder structure**: `(auth)`, `(registration)`, `(tabs)`
- **Clean separation** of concerns
- **Type-safe** implementation
- **Consistent patterns** across both apps
- **Simplified structure** for driver-specific needs

## **🚀 Next Steps**

1. **Test all registration flows** thoroughly
2. **Add error boundaries** for better error handling
3. **Implement offline support** if needed
4. **Add analytics** for registration completion tracking
5. **Performance monitoring** for vehicle API calls

This conversion provides a **robust, scalable, and maintainable** authentication system for the driver app with **simplified store structure**, **clean separation of vehicle APIs**, and **organized folder structure** while maintaining consistency with the customer app! 🚗✨ 