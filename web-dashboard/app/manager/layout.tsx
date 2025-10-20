import { ReactNode } from "react";
import ManagerSidebar from "@/components/manager/ManagerSidebar";
import ManagerHeader from "@/components/manager/ManagerHeader";
import RoleProtection from "@/components/auth/RoleProtection";

interface ManagerLayoutProps {
  children: ReactNode;
}

export default function ManagerLayout({ children }: ManagerLayoutProps) {
  return (
    <RoleProtection requiredRole="MANAGER">
      <div className="h-screen bg-gray-100 flex flex-col">
        {/* Header - Full Width */}
        <ManagerHeader />
        
        {/* Content Area with Sidebar and Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <ManagerSidebar />
          
          {/* Main Dashboard Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </RoleProtection>
  );
}
