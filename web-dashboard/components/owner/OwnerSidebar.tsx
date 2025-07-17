"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Plus,
  UserPlus,
  CreditCard,
  Settings,
  LogOut,
  List,
} from "lucide-react";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

export default function OwnerSidebar() {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/owner",
    },
    {
      icon: List,
      label: "Vehicle List",
      href: "/owner/vehicle-list",
    },
    {
      icon: Plus,
      label: "Add Vehicle",
      href: "/owner/add-vehicle",
    },
    {
      icon: UserPlus,
      label: "Add Driver",
      href: "/owner/add-driver",
    },
    {
      icon: CreditCard,
      label: "Payment History",
      href: "/owner/payment-history",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/owner/settings",
    },
  ];

  return (
    <div className="w-64 bg-blue-900 text-white flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-blue-800">
        <h2 className="text-xl font-bold">YathraGo Owner</h2>
        <p className="text-blue-200 text-sm mt-1">Fleet Management</p>
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
                    "flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 hover:bg-blue-800",
                    isActive && "bg-blue-700 text-white"
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
      <div className="p-4 border-t border-blue-800">
        <button
          className="flex items-center w-full px-2 py-3 text-sm font-medium text-white hover:bg-blue-800 rounded-lg transition-colors duration-200"
          onClick={() => {
            // Handle logout
            console.log("Logout clicked");
          }}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 text-xs text-blue-200 border-t border-blue-800">
        <div>Fleet Dashboard v1.0</div>
        <div>Last Login: {new Date().toLocaleDateString()}</div>
      </div>
    </div>
  );
}
