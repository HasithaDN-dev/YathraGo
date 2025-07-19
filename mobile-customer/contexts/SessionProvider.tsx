// In: contexts/SessionProvider.tsx
// As per the Expo docs, we'll create a simple context to provide the session state.
// This works hand-in-hand with our Zustand store.

import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../lib/stores/auth.store';

// Define the shape of the context value
interface SessionContextType {
  token: string | null;
  status: 'loading' | 'signedOut' | 'signedIn';
}

// Create the context
const SessionContext = createContext<SessionContextType | null>(null);

// Create the provider component
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { token, status, hydrate } = useAuthStore();

  useEffect(() => {
    // This ensures the store is hydrated from storage when the provider mounts
    hydrate();
  }, []);

  return (
    <SessionContext.Provider value={{ token, status }}>
      {children}
    </SessionContext.Provider>
  );
}

// Create a custom hook to easily access the context
export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return value;
}
