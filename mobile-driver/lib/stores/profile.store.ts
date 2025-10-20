type ActiveProfile = { id: string | number; type: 'child' | 'staff' } | undefined;
type CustomerProfile = { customer_id: number } | undefined;

export function useProfileStore(): { activeProfile: ActiveProfile; customerProfile: CustomerProfile } {
  // Minimal stub: no active profile by default
  return {
    activeProfile: undefined,
    customerProfile: undefined,
  };
}
