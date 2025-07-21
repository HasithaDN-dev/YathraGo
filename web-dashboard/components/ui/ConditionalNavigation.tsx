"use client";

import { usePathname } from "next/navigation";
import { NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink
} from "@/components/ui/navigation-menu";
import Image from "next/image";

export default function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Don't show navigation on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <NavigationMenu className="bg-light-gray text-deep-navy w-full max-w-none p-4">
      <div className="w-full max-w-none flex justify-between items-center">
        <NavigationMenuList>
          <NavigationMenuItem className="no-hover">
            <NavigationMenuLink href="/">
              <Image src="/logo.svg" alt="Yathra-Go" width={100} height={40} />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/student">Student</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/office-staff">Office Staff</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/driver">Driver</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/owner">Owner</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/admin">Admin</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/login">Login</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/sign-in">Sign In</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </div>
    </NavigationMenu>
  );
}
