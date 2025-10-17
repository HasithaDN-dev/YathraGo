"use client";

import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useOwner } from "@/components/owner/OwnerContext";

export default function OwnerHeader() {
  const { firstName, lastName, role } = useOwner();

  return (
    <header className="bg-white border-b border-[var(--neutral-gray)] px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Search */}
        {/* Logo with link */}
        <Link href="/" passHref>
          <Image
            src="/Logo.svg"
            alt="YathraGo Logo"
            width={100}
            height={40}
          />
        </Link>

        {/* Righ</a>t side - Notifications and Profile */}
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
            <div className="w-8 h-8 bg-[var(--bright-orange)] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-[var(--black)]" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-[var(--color-deep-navy)]">{firstName || "Owner"} {lastName}</p>
              <p className="text-xs text-[var(--neutral-gray)]">{(role) || "Owner"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
