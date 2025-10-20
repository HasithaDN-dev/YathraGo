import { ReactNode } from "react";
import DriverCoordinatorSidebar from "@/components/driver-coordinator/DriverCoordinatorSidebar";
import ManagerHeader from "@/components/manager/ManagerHeader";
import RoleProtection from "@/components/auth/RoleProtection";

interface DriverCoordinatorLayoutProps {
  children: ReactNode;
}

export default function DriverCoordinatorLayout({ children }: DriverCoordinatorLayoutProps) {
  return (
    <RoleProtection requiredRole="DRIVER_COORDINATOR">
      <div className="h-screen bg-gray-100 flex flex-col">
        <ManagerHeader />
        <div className="flex flex-1 overflow-hidden">
          <DriverCoordinatorSidebar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </RoleProtection>
  );
}
