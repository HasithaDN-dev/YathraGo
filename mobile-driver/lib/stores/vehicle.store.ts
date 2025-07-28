import { create } from 'zustand';
import { getVehicleListApi, getVehicleDetailsApi } from '../api/vehicle.api';

interface Vehicle {
  id: string;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  yearOfManufacture: string;
  vehicleColor: string;
  licensePlate: string;
  seats: number;
  femaleAssistant: boolean;
  frontView?: string;
  sideView?: string;
  rearView?: string;
  interiorView?: string;
  revenueLicense?: string;
  vehicleInsurance?: string;
  registrationDoc?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface VehicleFormData {
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
  revenueLicense?: any;
  vehicleInsurance?: any;
  registrationDoc?: any;
}

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

const initialVehicleFormData: VehicleFormData = {
  vehicleType: '',
  vehicleBrand: '',
  vehicleModel: '',
  yearOfManufacture: '',
  vehicleColor: '',
  licensePlate: '',
  seats: 1,
  femaleAssistant: false,
};

export const useVehicleStore = create<VehicleState>((set, get) => ({
  // Initial state
  vehicles: [],
  selectedVehicle: null,
  vehicleFormData: initialVehicleFormData,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  
  // Vehicle loading actions
  loadVehicles: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const vehicles = await getVehicleListApi(token);
      set({ vehicles, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load vehicles';
      set({ error: errorMessage, isLoading: false });
      console.error('Vehicle loading error:', error);
    }
  },
  
  loadVehicleDetails: async (token, vehicleId) => {
    set({ isLoading: true, error: null });
    try {
      const vehicle = await getVehicleDetailsApi(token, vehicleId);
      set({ selectedVehicle: vehicle, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load vehicle details';
      set({ error: errorMessage, isLoading: false });
      console.error('Vehicle details loading error:', error);
    }
  },
  
  selectVehicle: (vehicle) => {
    set({ selectedVehicle: vehicle });
  },
  
  // Form actions
  updateVehicleForm: (data) => {
    set((state) => ({
      vehicleFormData: { ...state.vehicleFormData, ...data }
    }));
  },
  
  resetVehicleForm: () => {
    set({ vehicleFormData: initialVehicleFormData });
  },
  
  setVehicleFormData: (data) => {
    set({ vehicleFormData: data });
  },
  
  // Utility actions
  clearError: () => {
    set({ error: null });
  },
  
  addVehicle: (vehicle) => {
    set((state) => ({
      vehicles: [...state.vehicles, vehicle]
    }));
  },
  
  updateVehicle: (vehicleId, updatedVehicle) => {
    set((state) => ({
      vehicles: state.vehicles.map(v => 
        v.id === vehicleId ? updatedVehicle : v
      ),
      selectedVehicle: state.selectedVehicle?.id === vehicleId ? updatedVehicle : state.selectedVehicle
    }));
  },
  
  removeVehicle: (vehicleId) => {
    set((state) => ({
      vehicles: state.vehicles.filter(v => v.id !== vehicleId),
      selectedVehicle: state.selectedVehicle?.id === vehicleId ? null : state.selectedVehicle
    }));
  },
})); 