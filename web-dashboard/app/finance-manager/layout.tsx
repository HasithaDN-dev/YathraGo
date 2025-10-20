import { ReactNode } from "react";
import FinanceManagerSidebar from "@/components/finance-manager/FinanceManagerSidebar";
import ManagerHeader from "@/components/manager/ManagerHeader";
import RoleProtection from "@/components/auth/RoleProtection";

interface FinanceManagerLayoutProps {
  children: ReactNode;
}

export default function FinanceManagerLayout({ children }: FinanceManagerLayoutProps) {
  return (
    <RoleProtection requiredRole="FINANCE_MANAGER">
      <div className="h-screen bg-gray-100 flex flex-col">
        <ManagerHeader />
        <div className="flex flex-1 overflow-hidden">
          <FinanceManagerSidebar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </RoleProtection>
  );
}
