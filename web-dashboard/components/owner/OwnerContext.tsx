"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

interface OwnerState {
  firstName: string;
  lastName: string;
  role?: string;
}

interface OwnerContextType extends OwnerState {
  setOwner: (o: Partial<OwnerState>) => void;
  refreshOwner: () => Promise<void>;
}

const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

export const useOwner = () => {
  const ctx = useContext(OwnerContext);
  if (!ctx) throw new Error("useOwner must be used within OwnerProvider");
  return ctx;
};

export const OwnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [role, setRole] = useState<string | undefined>(undefined);

  const refreshOwner = async () => {
    const token = Cookies.get("access_token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:3000/owner/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      setFirstName(data.firstName || data.first_name || "");
      setLastName(data.lastName || data.last_name || "");
      setRole(data.role || data.roleName || undefined);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // load owner profile from backend on mount
    void refreshOwner();
  }, []);

  const setOwner = (o: Partial<OwnerState>) => {
    if (o.firstName !== undefined) setFirstName(o.firstName);
    if (o.lastName !== undefined) setLastName(o.lastName);
    if (o.role !== undefined) setRole(o.role);
  };

  return (
    <OwnerContext.Provider value={{ firstName, lastName, role, setOwner, refreshOwner }}>
      {children}
    </OwnerContext.Provider>
  );
};

export default OwnerContext;
