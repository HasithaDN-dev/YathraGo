"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Database,
  Shield,
  Users,
  Settings,
  LogOut,
  Monitor,
  FileText,
} from "lucide-react";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/admin",
    },
    {
      icon: Users,
      label: "Role & Permission Management",
      href: "/admin/roles",
    },
    {
      icon: Database,
      label: "Backup & Recovery",
      href: "/admin/backup",
    },
    {
      icon: Shield,
      label: "Compliance Management",
      href: "/admin/compliance",
    },
    {
      icon: FileText,
      label: "Audit Trails",
      href: "/admin/audit",
    },
    
    {
      icon: Monitor,
      label: "System Monitoring",
      href: "/admin/monitoring",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/admin/settings",
    },
  ];

  return (
    <div className="w-64 bg-blue-900 text-white flex flex-col h-full">
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
        <div>System Version: v2.1.4</div>
        <div>Last Admin Login: 2025-07-15 10:30 AM</div>
      </div>
    </div>
  );
}
