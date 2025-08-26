"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UserCheck,
  Car,
  MessageSquare,
  FileText,
  DollarSign,
  LogOut,
  Bell,
} from "lucide-react";
import { useRouter } from 'next/navigation';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

export default function ManagerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Remove access_token cookie
    document.cookie = 'access_token=; Max-Age=0; path=/;';
    // Optionally clear other cookies or localStorage if used
    router.push('/login');
  };

  const menuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/manager",
    },
    {
      icon: UserCheck,
      label: "Verify Drivers",
      href: "/manager/verify-drivers",
    },
    {
      icon: Car,
      label: "Approve Vehicles",
      href: "/manager/approve-vehicles",
    },
    {
      icon: MessageSquare,
      label: "Handle Complaints",
      href: "/manager/handle-complaints",
    },
    {
      icon: Bell,
      label: "Publish Notices",
      href: "/manager/publish-notices",
    },
    {
      icon: DollarSign,
      label: "Revenue Management",
      href: "/manager/revenue-management",
    },
    {
      icon: FileText,
      label: "Generate Reports",
      href: "/manager/generate-reports",
    },
  ];

  return (
    <div className="w-64 bg-[var(--color-deep-navy)] text-white flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-[var(--light-navy)]">
        <h2 className="text-xl font-bold">YathraGo Manager</h2>
        <p className="text-green-100 text-sm mt-1">Operations Control</p>
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
                    isActive && "bg-[var(--bright-orange)] text-white"
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
        <div>Manager Dashboard v1.0</div>
        <div>Last Login: {new Date().toLocaleDateString()}</div>
      </div>
    </div>
  );
}
