"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { ownerApi } from "@/lib/api/owner";
import type { Vehicle, Driver, Payment } from "@/types/api";

interface OwnerState {
  username: string;
  role?: string;
  vehicles?: Vehicle[];
  drivers?: Driver[];
  paymentHistory?: Payment[];
}

interface OwnerContextType extends OwnerState {
  setOwner: (o: Partial<OwnerState>) => void;
  refreshOwner: () => Promise<void>;
  fetchVehicles: () => Promise<void>;
  fetchDrivers: () => Promise<void>;
  fetchPaymentHistory: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

export const useOwner = () => {
  const ctx = useContext(OwnerContext);
  if (!ctx) {
    // Return a safe default to avoid runtime errors during prerendering.
    return {
      username: "",
      role: undefined,
      vehicles: [],
      drivers: [],
      paymentHistory: [],
      setOwner: () => {},
      refreshOwner: async () => {},
      fetchVehicles: async () => {},
      fetchDrivers: async () => {},
      fetchPaymentHistory: async () => {},
      loading: false,
      error: null,
      clearError: () => {},
    } as OwnerContextType;
  }
  return ctx;
};

export const OwnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string | undefined>(undefined);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshOwner = useCallback(async () => {
    const token = Cookies.get("access_token");
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await ownerApi.getProfile();
      // prefer explicit username fields, fall back to first/last concatenation if available
      const uname = data.username || (data.firstName ? `${data.firstName}${data.lastName ? ' ' + data.lastName : ''}` : "");
      setUsername(uname || "");
      setRole(data.role || data.roleName || undefined);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load profile. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ownerApi.getVehicles();
      setVehicles(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load vehicles. Please try again.";
      setError(errorMessage);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ownerApi.getDrivers();
      setDrivers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load drivers. Please try again.";
      setError(errorMessage);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaymentHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ownerApi.getPaymentHistory();
      setPaymentHistory(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load payment history. Please try again.";
      setError(errorMessage);
      setPaymentHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // load owner profile from backend on mount
    void refreshOwner();
  }, [refreshOwner]);

  const setOwner = (o: Partial<OwnerState>) => {
    if (o.username !== undefined) setUsername(o.username);
    if (o.role !== undefined) setRole(o.role);
    if (o.vehicles !== undefined) setVehicles(o.vehicles);
    if (o.drivers !== undefined) setDrivers(o.drivers);
    if (o.paymentHistory !== undefined) setPaymentHistory(o.paymentHistory);
  };

  return (
    <OwnerContext.Provider value={{ 
      username, 
      role, 
      vehicles, 
      drivers, 
      paymentHistory, 
      setOwner, 
      refreshOwner,
      fetchVehicles,
      fetchDrivers,
      fetchPaymentHistory,
      loading,
      error,
      clearError
    }}>
      {children}
    </OwnerContext.Provider>
  );
};

export default OwnerContext;
