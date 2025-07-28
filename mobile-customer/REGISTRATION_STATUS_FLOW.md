# 🔄 Registration Status Flow Documentation

## **Overview**

The `registrationStatus` field tracks a customer's progress through the multi-step registration process in YathraGo. This ensures users complete all required steps before accessing the main app features.

## **📋 Registration Status Stages**

### **1. OTP_PENDING**
- **When**: User enters phone number, OTP is sent
- **Database State**: Customer record doesn't exist yet
- **Frontend Action**: Show OTP input screen
- **Next Step**: OTP verification

### **2. OTP_VERIFIED** ✅
- **When**: OTP is successfully verified
- **Database State**: Basic customer account created with minimal data
- **Frontend Action**: Navigate to customer registration screen
- **Backend Code**: Set in `auth.service.ts` when creating new customer
- **Next Step**: Complete customer profile

### **3. ACCOUNT_CREATED** ✅ (NEW)
- **When**: Customer completes basic profile (name, email, address, emergency contact)
- **Database State**: Customer profile is fully set up
- **Frontend Action**: Navigate to profile type selection (child/staff)
- **Backend Code**: Set in `customer.service.ts` - `completeCustomerRegistration()`
- **Next Step**: Create child or staff profile

### **4. HAVING_A_PROFILE** ✅
- **When**: Customer creates first child or staff profile
- **Database State**: Customer has at least one transport profile
- **Frontend Action**: Navigate to main app (tabs)
- **Backend Code**: Set in `customer.service.ts` - `registerChild()` and `registerStaffPassenger()`
- **Next Step**: Use the app

## **🔄 Complete Flow Diagram**

```
User enters phone → OTP_PENDING
     ↓
OTP verified → OTP_VERIFIED (basic account created)
     ↓
Customer profile completed → ACCOUNT_CREATED (profile setup done)
     ↓
First child/staff profile → HAVING_A_PROFILE (can access main app)
```

## **💻 Implementation Details**

### **Backend Changes**

#### **1. Customer Service (`customer.service.ts`)**
```typescript
async completeCustomerRegistration(dto: CustomerRegisterDto) {
  const updatedCustomer = await this.prisma.customer.update({
    where: { customer_id: dto.customerId },
    data: {
      name: dto.name,
      email: dto.email,
      address: dto.address,
      profileImageUrl: dto.profileImageUrl,
      emergencyContact: dto.emergencyContact,
      registrationStatus: 'ACCOUNT_CREATED', // ← Changed from OTP_VERIFIED
    },
  });
  
  return {
    customerId: updatedCustomer.customer_id,
    success: true,
    message: 'Customer registration completed',
    registrationStatus: updatedCustomer.registrationStatus, // ← Return status
  };
}
```

#### **2. Profile API (`profile.api.ts`)**
```typescript
// New API to get registration status
export const getRegistrationStatusApi = async (token: string): Promise<string> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/customer/profile`);
  const data = await response.json();
  return data.profile?.registrationStatus || 'OTP_PENDING';
};

// Updated customer profile API
export const completeCustomerProfileApi = async (
  token: string,
  data: CustomerProfileData
): Promise<{ customerId: string; success: boolean; message: string; registrationStatus?: string }> => {
  // ... existing code ...
  return response.json(); // Now includes registrationStatus
};
```

### **Frontend Changes**

#### **1. Auth Store (`auth.store.ts`)**
```typescript
interface AuthState {
  // ... existing fields ...
  registrationStatus: string; // ← New field
  setRegistrationStatus: (status: string) => void; // ← New method
}

// Implementation
setRegistrationStatus: (status: string) => {
  set({ registrationStatus: status });
},
```

#### **2. Verify OTP Screen (`verify-otp.tsx`)**
```typescript
// Check both profiles and registration status
const [profiles, registrationStatus] = await Promise.all([
  getProfilesApi(accessToken),
  getRegistrationStatusApi(accessToken)
]);

// Update registration status in auth store
const { setRegistrationStatus } = useAuthStore.getState();
setRegistrationStatus(registrationStatus);

// Determine next step based on status
if (registrationStatus === 'ACCOUNT_CREATED') {
  console.log('Customer registration completed, user needs to create profiles');
  setProfileComplete(false);
} else if (registrationStatus === 'OTP_VERIFIED') {
  console.log('Only OTP verified, user needs to complete customer registration');
  setProfileComplete(false);
}
```

#### **3. Customer Registration Screen (`customer-register.tsx`)**
```typescript
// Handle registration status response
const response = await completeCustomerProfileApi(accessToken, payload as CustomerProfileData);

// Update registration status in auth store
if (response.registrationStatus) {
  const { setRegistrationStatus, setCustomerRegistered } = useAuthStore.getState();
  setRegistrationStatus(response.registrationStatus);
  setCustomerRegistered(true);
}
```

## **🎯 Benefits of This Implementation**

### **1. Better User Experience**
- **Clear progression**: Users know exactly where they are in the process
- **Resume capability**: Users can continue from where they left off
- **Prevent confusion**: No more "brief flash" of wrong screens

### **2. Improved Business Logic**
- **Access control**: Different features available at different stages
- **Data integrity**: Ensure users complete required steps
- **Analytics**: Track completion rates at each stage

### **3. Enhanced Debugging**
- **Clear status tracking**: Easy to see where users get stuck
- **Better error handling**: Specific handling for each stage
- **Logging**: Detailed logs for troubleshooting

## **🔧 Navigation Logic**

### **Root Layout (`_layout.tsx`)**
```typescript
// Main app - requires HAVING_A_PROFILE
<Stack.Protected guard={isLoggedIn && isProfileComplete}>
  <Stack.Screen name="(tabs)" />
</Stack.Protected>

// Registration - requires OTP_VERIFIED or ACCOUNT_CREATED
<Stack.Protected guard={isLoggedIn && !isProfileComplete}>
  <Stack.Screen name="(registration)" />
</Stack.Protected>

// Auth - requires not logged in
<Stack.Protected guard={!isLoggedIn}>
  <Stack.Screen name="(auth)" />
</Stack.Protected>
```

## **📊 Status Transition Rules**

| Current Status | Allowed Actions | Next Status |
|----------------|-----------------|-------------|
| `OTP_PENDING` | Send OTP | `OTP_VERIFIED` |
| `OTP_VERIFIED` | Complete customer profile | `ACCOUNT_CREATED` |
| `ACCOUNT_CREATED` | Create child/staff profile | `HAVING_A_PROFILE` |
| `HAVING_A_PROFILE` | Use main app | (Final status) |

## **🚀 Future Enhancements**

### **1. Status Validation**
- Add validation to prevent invalid status transitions
- Ensure data consistency across status changes

### **2. Status History**
- Track status change history for audit purposes
- Enable rollback to previous status if needed

### **3. Status Notifications**
- Send notifications when users are stuck at a stage
- Provide helpful guidance for each status

### **4. Admin Dashboard**
- Show registration completion rates by status
- Identify bottlenecks in the registration process

## **✅ Testing Checklist**

- [ ] New user flow: OTP_PENDING → OTP_VERIFIED → ACCOUNT_CREATED → HAVING_A_PROFILE
- [ ] Returning user with profiles: Direct to HAVING_A_PROFILE
- [ ] Returning user without profiles: Check registration status
- [ ] Error handling: Invalid status transitions
- [ ] Navigation: Correct screens shown for each status
- [ ] Data persistence: Status saved and restored correctly

This implementation provides a **robust, scalable, and user-friendly** registration flow that ensures users complete all required steps while providing a smooth experience! 🎉 