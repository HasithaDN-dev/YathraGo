import { getAssignedPassengersApi } from '../api/childRideRequest.api';

// Use star-import and prefer .default when available. This avoids runtime
// issues in Hermes/Metro where the default export may be wrapped in an object.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
        try {
          const childIds = items.map((it) => it.child?.child_id).filter(Boolean);
          console.log('[passenger-store] setPassengers - count:', items.length, 'childIds:', childIds);
        } catch (e) {
          console.error('[passenger-store] setPassengers log error', e);
        }
      },
      clear: () => set({ byId: {}, ids: [], loading: false, error: null }),
      fetchForDriver: async (token: string) => {
        set({ loading: true, error: null });
        try {
          const data = (await getAssignedPassengersApi(token)) as RideRequestPassengerDto[];
          // console.log('[passenger-store] raw fetched data:', JSON.stringify(data, null, 2));
          if (data && data.length > 0) {
            // console.log('[passenger-store] example passenger object:', data[0]);
            try {
              const childObj = data[0].child || {};
              const customerObj = data[0].customer || {};
              // console.log('[passenger-store] example child keys:', Object.keys(childObj));
              // console.log('[passenger-store] example customer keys:', Object.keys(customerObj));
            } catch (e) {
              // console.error('[passenger-store] error logging example passenger keys', e);
            }
          }
          // build normalized map
          const byId: Record<number, RideRequestPassengerDto> = {};
          const ids: number[] = [];
          data.forEach((it) => {
            byId[it.rideRequestId] = it;
            ids.push(it.rideRequestId);
          });
          set({ byId, ids, loading: false, error: null });
          try {
            const childIds = data.map((it) => it.child?.child_id).filter(Boolean);
            console.log('[passenger-store] fetchForDriver fetched:', data.length, 'passengers. childIds:', childIds);
          } catch (e) {
            console.error('[passenger-store] fetchForDriver log error', e);
          }
        } catch (err: any) {
          set({ error: err?.message ?? 'Unknown error', loading: false });
        }
      },
    }),
    {
      name: 'passenger-store',
      onRehydrateStorage: () => (state: any, error: any) => {
        if (error) {
          console.error('[passenger-store] rehydrate error', error);
          return;
        }
        try {
          console.log('[passenger-store] rehydrated state:', state);
          const byId = state?.byId || {};
          const childIds = Object.values(byId).map((p: any) => p.child?.child_id).filter(Boolean);
          console.log('[passenger-store] rehydrated child IDs:', childIds);
        } catch (e) {
          console.error('[passenger-store] rehydrate log error', e);
        }
      },
    }
  )
);

export default usePassengerStore;
