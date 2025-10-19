"use client";

import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ConditionalNavigation() {
  const pathname = usePathname();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  // ...existing code...

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isClicked && !(event.target as Element).closest('.roles-dropdown')) {
        setIsClicked(false);
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isClicked]);

  // Only show navigation on root path
  if (pathname !== '/') {
    return null;
  }

  // ...existing code...

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event from bubbling up
    setIsClicked(!isClicked);
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <NavigationMenu className="bg-white border-b border-[var(--neutral-gray)] w-full py-4 fixed top-0 z-50">
      <div className="flex justify-between items-center w-full px-6">
        {/* Left corner: Logo (updated to match OwnerHeader) */}
        <Link href="/" passHref>
          <Image
            src="/Logo.svg"
            alt="YathraGo Logo"
            width={100}
            height={40}
          />
        </Link>


        {/* Center: Navigation items */}
        <NavigationMenuList className="flex space-x-8">
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem
            onClick={handleClick}
            className="relative roles-dropdown"
          >
            <span className="cursor-pointer text-[14px]">Roles</span>
            {isDropdownOpen && (
              <div 
                className="absolute top-full left-0 bg-white shadow-md rounded-md mt-2 min-w-[100px] text-[14px]"
              >
                <NavigationMenuList className="flex flex-col w-full">
                  <NavigationMenuItem className="w-full">
                     {/*<NavigationMenuLink href="/student" className="block px-4 py-2 hover:bg-blue-700 hover:text-white w-full text-gray-700 transition-colors">Student</NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem className="w-full">
                    <NavigationMenuLink href="/office-staff" className="block px-4 py-2 hover:bg-blue-700 hover:text-white w-full text-gray-700 transition-colors">Office Staff</NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem className="w-full">
                    <NavigationMenuLink href="/driver" className="block px-4 py-2 hover:bg-blue-700 hover:text-white w-full text-gray-700 transition-colors">Driver</NavigationMenuLink>*/}
                  </NavigationMenuItem>
                  <NavigationMenuItem className="w-full">
                    <NavigationMenuLink href="/owner" className="block px-4 py-2 hover:bg-blue-700 hover:text-white w-full text-gray-700 transition-colors">Owner</NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem className="w-full">
                    <NavigationMenuLink href="/finance-manager" className="block px-4 py-2 hover:bg-blue-700 hover:text-white w-full text-gray-700 transition-colors">Finance Manager</NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem className="w-full">
                    <NavigationMenuLink href="/driver-coordinator" className="block px-4 py-2 hover:bg-blue-700 hover:text-white w-full text-gray-700 transition-colors">Driver Coordinator</NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem className="w-full">
                    <NavigationMenuLink href="/manager" className="block px-4 py-2 hover:bg-blue-700 hover:text-white w-full text-gray-700 transition-colors">Manager</NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem className="w-full">
                    <NavigationMenuLink href="/admin" className="block px-4 py-2 hover:bg-blue-700 hover:text-white w-full text-gray-700 transition-colors">Admin</NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </div>
            )}
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/#features">Features</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/#contact">Contact</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/about">About</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>

        {/* Right corner: Login and Sign In */}
        <NavigationMenuList className="flex space-x-4 mr-2">
          <NavigationMenuItem>
            <NavigationMenuLink href="/login">Login</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/signup">Sign Up</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </div>
    </NavigationMenu>
  );
}
