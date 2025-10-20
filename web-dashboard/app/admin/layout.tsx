import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import RoleProtection from "@/components/auth/RoleProtection";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <RoleProtection requiredRole="ADMIN">
      <div className="h-screen bg-gray-100 flex flex-col">
        {/* Header - Full Width */}
        <AdminHeader />
        
        {/* Content Area with Sidebar and Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <AdminSidebar />
          
          {/* Main Dashboard Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </RoleProtection>
  );
}
