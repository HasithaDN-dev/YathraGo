import { ReactNode } from "react";
import OwnerSidebar from "@/components/owner/OwnerSidebar";
import OwnerHeader from "@/components/owner/OwnerHeader";
import { OwnerProvider } from "@/components/owner/OwnerContext";

interface OwnerLayoutProps {
  children: ReactNode;
}

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  return (
    <OwnerProvider>
      <div className="h-screen bg-gray-100 flex flex-col">
        {/* Header - Full Width */}
        <OwnerHeader />
        
        {/* Content Area with Sidebar and Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <OwnerSidebar />
          
          {/* Main Dashboard Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </OwnerProvider>
  );
}
