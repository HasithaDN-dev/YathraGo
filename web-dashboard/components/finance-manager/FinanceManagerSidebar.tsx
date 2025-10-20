"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  DollarSign,
  RefreshCw,
  Settings,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { logoutAndRedirectHome } from '@/lib/auth';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

export default function FinanceManagerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logoutAndRedirectHome(router);
  };

  const menuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/finance-manager",
    },
    {
      icon: CreditCard,
      label: "Handle Payments",
      href: "/finance-manager/payments",
    },
    {
      icon: DollarSign,
      label: "Approve Payouts",
      href: "/finance-manager/approve-payouts",
    },
    {
      icon: RefreshCw,
      label: "Handle Refunds",
      href: "/finance-manager/refunds",
    },
    {
      icon: TrendingUp,
      label: "Payment Reports",
      href: "/finance-manager/payment-reports",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/finance-manager/settings",
    },
  ];

  return (
    <div className="w-64 bg-[var(--color-deep-navy)] text-white flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-[var(--light-navy)]">
        <h2 className="text-xl font-bold">YathraGo</h2>
        <p className="text-green-100 text-sm mt-1">Finance Manager</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 hover:bg-[var(--light-navy)]",
                    isActive && "bg-[var(--bright-orange)] text-[var(--black)]"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-green-700">
        <button
          className="flex items-center w-full px-2 py-3 text-sm font-medium text-white hover:bg-green-700 rounded-lg transition-colors duration-200"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 text-xs text-green-100 border-t border-green-700">
        <div>Finance Manager v1.0</div>
        <div>Last Login: {new Date().toLocaleDateString()}</div>
      </div>
    </div>
  );
}