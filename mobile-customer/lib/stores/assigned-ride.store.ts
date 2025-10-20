// Store for managing assigned ride information
import { create } from 'zustand';
import { assignedRideApi, AssignedRideResponse } from '../api/assigned-ride.api';

interface AssignedRideState {
  assignedRide: AssignedRideResponse | null;
  isLoading: boolean;
  error: string | null;
  loadAssignedRide: (profileType: 'child' | 'staff', profileId?: number) => Promise<void>;
  clearAssignedRide: () => void;
  clearError: () => void;
}

export const useAssignedRideStore = create<AssignedRideState>((set) => ({
  assignedRide: null,
  isLoading: false,
  error: null,

  loadAssignedRide: async (profileType: 'child' | 'staff', profileId?: number) => {
    set({ isLoading: true, error: null });
    try {
      let rideData: AssignedRideResponse | null = null;

      if (profileType === 'child' && profileId) {
        rideData = await assignedRideApi.getAssignedChildRide(profileId);
      } else if (profileType === 'staff') {
        rideData = await assignedRideApi.getAssignedStaffRide();
      }

      set({ assignedRide: rideData, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load assigned ride';
      set({ error: errorMessage, isLoading: false, assignedRide: null });
      console.error('Load assigned ride error:', error);
    }
  },

  clearAssignedRide: () => {
    set({ assignedRide: null, error: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
