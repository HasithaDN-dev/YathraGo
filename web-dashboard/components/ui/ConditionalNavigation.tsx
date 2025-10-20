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
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';
import { logoutAndRedirectHome } from '@/lib/auth';
import { getAuthenticatedUser, getAccessibleNavItems, type UserRole } from '@/lib/rbac';

export default function ConditionalNavigation() {
  const pathname = usePathname();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  const toggleProfile = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setProfileOpen(p => {
      const next = !p;
      if (next && profileButtonRef.current) {
        const rect = profileButtonRef.current.getBoundingClientRect();
        setDropdownPos({ top: rect.bottom + 8, left: rect.right - 160 });
      }
      return next;
    });
  };

  useEffect(() => {
    if (!profileOpen) {
      setDropdownPos(null);
    }
  }, [profileOpen]);
  // ...existing code...

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isClicked && !(event.target as Element).closest('.roles-dropdown')) {
        setIsClicked(false);
        setDropdownOpen(false);
      }
      // close profile dropdown if clicking outside of it or the profile button
      if (profileOpen) {
        const target = event.target as Node;
        const dropdownEl = document.querySelector('.profile-dropdown');
        const clickedInsideDropdown = dropdownEl ? dropdownEl.contains(target) : false;
        const clickedProfileButton = profileButtonRef.current ? profileButtonRef.current.contains(target) : false;
        if (!clickedInsideDropdown && !clickedProfileButton) {
          setProfileOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isClicked, profileOpen, setProfileOpen]);

  // Determine auth state from cookie or localStorage
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const deriveFromEmail = (email?: string | null) => {
      if (!email) return null;
      try {
        const local = String(email).split("@")[0];
        return local || null;
      } catch {
        return null;
      }
    };

    const normalizeName = (raw?: string | null) => {
      if (!raw) return null;
      // Replace common delimiters with spaces, trim, collapse multiple spaces
      let s = String(raw).trim();
      // Insert space between camelCase / PascalCase boundaries (e.g., GeneralManager -> General Manager)
      s = s.replace(/([a-z])([A-Z])/g, '$1 $2');
      s = s.replace(/[._-]+/g, ' ');
      s = s.replace(/\s+/g, ' ');
      // If the string is a single concatenated word, try to split by known role keywords
      const keywords = ['general', 'manager', 'owner', 'finance', 'driver', 'coordinator', 'admin'];
      if (!s.includes(' ')) {
        // lowercase single-word like "generalmanager"
        if (/^[a-z]+$/.test(s)) {
          for (const kw of keywords) {
            const idx = s.indexOf(kw);
                // allow split when keyword starts anywhere after the first character
                if (idx > 0 && idx < s.length) {
                  s = s.slice(0, idx) + ' ' + s.slice(idx);
                  break;
                }
          }
        } else {
          // mixed or PascalCase like "Generalmanager" or "GeneralManager" - try case-insensitive keyword match
          const lower = s.toLowerCase();
          for (const kw of keywords) {
            const idx = lower.indexOf(kw);
            // allow split when keyword starts anywhere after the first character
            if (idx > 0 && idx < lower.length) {
              s = s.slice(0, idx) + ' ' + s.slice(idx);
              break;
            }
          }
        }
      }
      // If it's an email local part like "john.doe", it becomes "john doe"
      // Title-case each word
      s = s.split(' ').map(w => w ? (w.charAt(0).toUpperCase() + w.slice(1)) : '').join(' ');
      return s || null;
    };

    const checkAuthState = () => {
      const authenticatedUser = getAuthenticatedUser();
      
      if (authenticatedUser) {
        const usernameField = authenticatedUser.username;
        const first = authenticatedUser.firstName;
        const last = authenticatedUser.lastName;
        const emailField = authenticatedUser.email;

        let name: string | null = null;
        if (usernameField) name = normalizeName(usernameField);
        else if (first) name = normalizeName(first + (last ? ` ${last}` : ""));
        else name = normalizeName(deriveFromEmail(emailField));

        setUserName(name);
        setUserRole(authenticatedUser.role);
        return;
      }

      // Fallback to old method if new authentication doesn't work
      const token = Cookies.get("access_token");
      const stored = localStorage.getItem("user");

      if (!token && !stored) {
        setUserName(null);
        setUserRole(null);
        return;
      }

      if (stored) {
        try {
          const u = JSON.parse(stored);
          // Prefer explicit username, then first+last, then name, then derive from email
          const usernameField = u.username && String(u.username).trim();
          const first = (u.firstName || u.first_name) && String(u.firstName || u.first_name).trim();
          const last = (u.lastName || u.last_name) && String(u.lastName || u.last_name).trim();
          const nameField = u.name && String(u.name).trim();
          const emailField = u.email && String(u.email).trim();

          let name: string | null = null;
          if (usernameField) name = normalizeName(usernameField as string);
          else if (first) name = normalizeName(first + (last ? ` ${last}` : ""));
          else if (nameField) name = normalizeName(nameField as string);
          else name = normalizeName(deriveFromEmail(emailField));

          setUserName(name);
          setUserRole(u.role as UserRole);
          return;
        } catch {
          // ignore
        }
      }

      if (token) {
        // If token exists but no user in storage, try to decode a username from token (JWT) as a best-effort
        try {
          const payload = token.split('.')[1];
          const json = JSON.parse(atob(payload));
          const usernameField = json.username && String(json.username).trim();
          const first = (json.firstName || json.first_name) && String(json.firstName || json.first_name).trim();
          const last = (json.lastName || json.last_name) && String(json.lastName || json.last_name).trim();
          const nameField = json.name && String(json.name).trim();
          const emailField = json.email && String(json.email).trim();

          let name: string | null = null;
          if (usernameField) name = normalizeName(usernameField as string);
          else if (first) name = normalizeName(first + (last ? ` ${last}` : ""));
          else if (nameField) name = normalizeName(nameField as string);
          else name = normalizeName(deriveFromEmail(emailField));

          setUserName(name);
          setUserRole(json.role as UserRole);
        } catch {
          // ignore
        }
      } else {
        setUserName(null);
        setUserRole(null);
      }
    };

    checkAuthState();
  }, [pathname]);

  // ...existing code...

  const router = useRouter();

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
            {isDropdownOpen && userRole && (
              <div 
                className="absolute top-full left-0 bg-white shadow-md rounded-md mt-2 min-w-[100px] text-[14px]"
              >
                <NavigationMenuList className="flex flex-col w-full">
                  {getAccessibleNavItems(userRole).map((item, index) => (
                    <NavigationMenuItem key={index} className="w-full">
                      <NavigationMenuLink 
                        href={item.href} 
                        className="block px-4 py-2 hover:bg-blue-700 hover:text-white w-full text-gray-700 transition-colors"
                      >
                        {item.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </div>
            )}
            {/* Show message when no role or not authenticated */}
            {isDropdownOpen && !userRole && (
              <div 
                className="absolute top-full left-0 bg-white shadow-md rounded-md mt-2 min-w-[150px] text-[14px]"
              >
                <div className="px-4 py-2 text-gray-500 text-center">
                  Please log in to access role-specific pages
                </div>
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
            <NavigationMenuLink href="/#who-we-are">About</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>

        {/* Right corner: Login/Signup or Username + Logout */}
        <NavigationMenuList className="flex items-center space-x-4 mr-2">
          {userName ? (
            <div className="relative">
              <div className="flex items-center space-x-3">
                <button ref={profileButtonRef} onClick={toggleProfile} className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[var(--bright-orange)] rounded-full flex items-center justify-center text-sm font-semibold text-[var(--black)]">
                    {/** initials */}
                    {userName.split(' ').map(s => s ? s[0].toUpperCase() : '').slice(0,2).join('')}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{userName}</p>
                  </div>
                </button>

                {/* Dropdown */}
                {profileOpen && dropdownPos && profileButtonRef.current && createPortal(
                  <div
                    className="w-40 bg-white border rounded-md shadow-lg z-50 profile-dropdown"
                    style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left }}
                  >
                    <ul className="flex flex-col py-1">
                      <li>
                        <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            try {
                              logoutAndRedirectHome(router);
                            } catch {
                              // Best-effort fallback: prefer router navigation
                              try { 
                                router.push('/'); 
                              } catch { 
                                Cookies.remove("access_token"); 
                                localStorage.removeItem("user"); 
                                window.location.href = '/'; 
                              }
                            }
                            // Clear local state immediately
                            setUserName(null);
                            setUserRole(null);
                            setProfileOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>,
                  document.body
                )}
              </div>
            </div>
          ) : (
            <>
              <NavigationMenuItem>
                <NavigationMenuLink href="/login">Login</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/signup">Sign Up</NavigationMenuLink>
              </NavigationMenuItem>
            </>
          )}
        </NavigationMenuList>
      </div>
    </NavigationMenu>
  );
}
