"use client";

import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function ConditionalNavigation() {
  const pathname = usePathname();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Don't show navigation on admin and owner pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/owner')) {
    return null;
  }

  const handleMouseEnter = () => {
    setDropdownOpen(true);
  };

  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseLeave = () => {
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Set a new timeout with longer delay
    const newTimeoutId = setTimeout(() => {
      if (!isClicked) {
        setDropdownOpen(false);
      }
    }, 500); // Increased delay to 500ms
    
    setTimeoutId(newTimeoutId);
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event from bubbling up
    // Clear any existing timeout on click
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsClicked(!isClicked);
    setDropdownOpen(!isDropdownOpen);
  };

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
      // Clear timeout on unmount
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isClicked, timeoutId]);

  return (
    <NavigationMenu className="bg-light-gray text-deep-navy w-full py-2 fixed top-0 z-50">
      <div className="flex justify-between items-center w-full px-4">
        {/* Left corner: Logo */}
        <div className="flex items-center ml-2">
          <a href="/" className="block">
            <Image src="/logo.svg" alt="Yathra-Go" width={100} height={40} />
          </a>
        </div>

        {/* Center: Navigation items */}
        <NavigationMenuList className="flex space-x-8">
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/#features">Features</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            className="relative roles-dropdown"
          >
            <span className="cursor-pointer text-[14px]">Roles</span>
            {isDropdownOpen && (
              <div 
                className="absolute top-full left-0 bg-white shadow-md rounded-md mt-2 min-w-[100px] text-[14px]"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={handleMouseLeave}
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
                    <NavigationMenuLink href="/admin" className="block px-4 py-2 hover:bg-blue-700 hover:text-white w-full text-gray-700 transition-colors">Admin</NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </div>
            )}
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/about">About</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/#contact">Contact</NavigationMenuLink>
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
