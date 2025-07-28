import { create } from 'zustand';
import { Driver } from '../../types/driver.types';
import { getDriverProfileApi } from '../api/profile.api';
import { useAuthStore } from './auth.store';

// Registration form data interfaces
interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  secondaryPhone: string;
  city: string;
  profileImage?: any;
}

interface IdVerification {
  frontImage?: any;
  backImage?: any;
}

interface VehicleInfo {
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  yearOfManufacture: string;
  vehicleColor: string;
  licensePlate: string;
  seats: number;
  femaleAssistant: boolean;
  frontView?: any;
  sideView?: any;
  rearView?: any;
  interiorView?: any;
}

interface VehicleDocuments {
  revenueLicense?: any;
  vehicleInsurance?: any;
  registrationDoc?: any;
  licenseFront?: any;
  licenseBack?: any;
}

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

const initialPersonalInfo: PersonalInfo = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  email: '',
  secondaryPhone: '',
  city: '',
};

const initialIdVerification: IdVerification = {};

const initialVehicleInfo: VehicleInfo = {
  vehicleType: '',
  vehicleBrand: '',
  vehicleModel: '',
  yearOfManufacture: '',
  vehicleColor: '',
  licensePlate: '',
  seats: 1,
  femaleAssistant: false,
};

const initialVehicleDocuments: VehicleDocuments = {};

export const useDriverStore = create<DriverState>((set, get) => ({
  // Initial state
  profile: null,
  personalInfo: initialPersonalInfo,
  idVerification: initialIdVerification,
  vehicleInfo: initialVehicleInfo,
  vehicleDocuments: initialVehicleDocuments,
  isLoading: false,
  error: null,
  
  // Profile actions
  loadProfile: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await getDriverProfileApi(token);
      set({ profile, isLoading: false });
      
      // If we have a complete profile, mark profile as complete in auth store
      if (profile && profile.registrationStatus === 'ACCOUNT_CREATED') {
        const { setProfileComplete } = useAuthStore.getState();
        setProfileComplete(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile';
      set({ error: errorMessage, isLoading: false });
      console.error('Profile loading error:', error);
    }
  },
  

  
  updateProfile: (profile) => {
    set({ profile });
  },
  
  // Registration form actions
  updatePersonalInfo: (info) => {
    set((state) => ({
      personalInfo: { ...state.personalInfo, ...info }
    }));
  },

  updateIdVerification: (verification) => {
    set((state) => ({
      idVerification: { ...state.idVerification, ...verification }
    }));
  },

  updateVehicleInfo: (info) => {
    set((state) => ({
      vehicleInfo: { ...state.vehicleInfo, ...info }
    }));
  },

  updateVehicleDocuments: (documents) => {
    set((state) => ({
      vehicleDocuments: { ...state.vehicleDocuments, ...documents }
    }));
  },

  resetRegistration: () => {
    set({
      personalInfo: initialPersonalInfo,
      idVerification: initialIdVerification,
      vehicleInfo: initialVehicleInfo,
      vehicleDocuments: initialVehicleDocuments,
    });
  },

  isRegistrationComplete: () => {
    const { personalInfo, idVerification, vehicleInfo, vehicleDocuments } = get();
    
    // Check personal info
    const personalComplete = 
      personalInfo.firstName && 
      personalInfo.lastName && 
      personalInfo.dateOfBirth && 
      personalInfo.email && 
      personalInfo.secondaryPhone && 
      personalInfo.city;

    // Check ID verification
    const idComplete = idVerification.frontImage && idVerification.backImage;

    // Check vehicle info
    const vehicleComplete = 
      vehicleInfo.vehicleType && 
      vehicleInfo.vehicleBrand && 
      vehicleInfo.vehicleModel && 
      vehicleInfo.yearOfManufacture && 
      vehicleInfo.vehicleColor && 
      vehicleInfo.licensePlate && 
      vehicleInfo.seats > 0 &&
      vehicleInfo.frontView && 
      vehicleInfo.sideView && 
      vehicleInfo.rearView && 
      vehicleInfo.interiorView;

    // Check vehicle documents
    const documentsComplete = 
      vehicleDocuments.revenueLicense && 
      vehicleDocuments.vehicleInsurance && 
      vehicleDocuments.registrationDoc && 
      vehicleDocuments.licenseFront && 
      vehicleDocuments.licenseBack;

    return personalComplete && idComplete && vehicleComplete && documentsComplete;
  },
  
  // Utility actions
  clearError: () => {
    set({ error: null });
  },
})); 