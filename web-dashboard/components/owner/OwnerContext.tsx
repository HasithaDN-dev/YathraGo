"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { ownerApi } from "@/lib/api/owner";

interface OwnerState {
  username: string;
  role?: string;
  vehicles?: any[];
  drivers?: any[];
  paymentHistory?: any[];
}

interface OwnerContextType extends OwnerState {
  setOwner: (o: Partial<OwnerState>) => void;
  refreshOwner: () => Promise<void>;
  fetchVehicles: () => Promise<void>;
  fetchDrivers: () => Promise<void>;
  fetchPaymentHistory: () => Promise<void>;
  loading: boolean;
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
    } as OwnerContextType;
  }
  return ctx;
};

export const OwnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string | undefined>(undefined);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshOwner = useCallback(async () => {
    const token = Cookies.get("access_token");
    if (!token) return;
    try {
      setLoading(true);
      const data = await ownerApi.getProfile();
      // prefer explicit username fields, fall back to first/last concatenation if available
      const uname = data.username || data.user_name || (data.firstName || data.first_name ? `${data.firstName || data.first_name}${data.lastName ? ' ' + data.lastName : ''}` : "");
      setUsername(uname || "");
      setRole(data.role || data.roleName || undefined);
    } catch (error) {
      console.error('Failed to fetch owner profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ownerApi.getVehicles();
      setVehicles(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ownerApi.getDrivers();
      setDrivers(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaymentHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ownerApi.getPaymentHistory();
      setPaymentHistory(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
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
      loading
    }}>
      {children}
    </OwnerContext.Provider>
  );
};

export default OwnerContext;
