import create from 'zustand';
import { persist } from 'zustand/middleware';
import { getAssignedPassengersApi } from '../api/childRideRequest.api';

type CustomerMini = {
  customer_id: number;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  profileImageUrl?: string | null;
};

type ChildDto = {
  child_id: number;
  relationship?: string | null;
  nearbyCity?: string | null;
  schoolLocation?: string | null;
  school?: string | null;
  childFirstName?: string | null;
  childLastName?: string | null;
  gender?: string | null;
  childImageUrl?: string | null;
  pickUpAddress?: string | null;
  schoolLatitude?: number | null;
  schoolLongitude?: number | null;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  customerId?: number | null;
};

export type RideRequestPassengerDto = {
  rideRequestId: number;
  childId: number;
  driverId?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  Amount?: number | null;
  AssignedDate?: string | null;
  Estimation?: number | null;
  status?: string | null;
  child: ChildDto;
  customer?: CustomerMini | null;
};

// Note: we intentionally use `any` for the zustand store type here to avoid
// complex generic typing mismatches in this workspace. The runtime shape is
// documented by the code below.

export const usePassengerStore: any = (create as any)(
  persist(
    (set: any, get: any) => ({
      byId: {},
      ids: [],
      loading: false,
      error: null,
      setPassengers: (items: RideRequestPassengerDto[]) => {
        const byId: Record<number, RideRequestPassengerDto> = {};
        const ids: number[] = [];
        items.forEach((it) => {
          byId[it.rideRequestId] = it;
          ids.push(it.rideRequestId);
        });
        set({ byId, ids, loading: false, error: null });
      },
      clear: () => set({ byId: {}, ids: [], loading: false, error: null }),
      fetchForDriver: async (token: string) => {
        set({ loading: true, error: null });
        try {
          const data = (await getAssignedPassengersApi(token)) as RideRequestPassengerDto[];
          // build normalized map
          const byId: Record<number, RideRequestPassengerDto> = {};
          const ids: number[] = [];
          data.forEach((it) => {
            byId[it.rideRequestId] = it;
            ids.push(it.rideRequestId);
          });
          set({ byId, ids, loading: false, error: null });
        } catch (err: any) {
          set({ error: err?.message ?? 'Unknown error', loading: false });
        }
      },
    }),
    {
      name: 'passenger-store',
    }
  )
);

export default usePassengerStore;
