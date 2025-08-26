"use client";

import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export default function ManagerHeader() {
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      try {
        const decoded: { username?: string; email?: string; role?: string } = jwtDecode(token);

        console.log(decoded);
        if (decoded && decoded.username) {
          setUsername(decoded.username);
        } else if (decoded && decoded.email) {
          setUsername(decoded.email);
        }
        if (decoded && decoded.role) {
          setRole(decoded.role);
        }
      } catch {
        // Invalid token
      }
    }
  }, []);
  
  return (
    <header className="bg-white border-b border-[var(--neutral-gray)] px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo */}
        <Link href="/" passHref>
          <Image
            src="/Logo.svg"
            alt="YathraGo Logo"
            width={100}
            height={40}
          />
        </Link>

        {/* Right side - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-[var(--error-red)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Profile */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-[var(--color-deep-navy)]">{(username?.split('@')[0]) || "Manager"}</p>
              <p className="text-xs text-[var(--neutral-gray)]">{(role) || "Manager"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
