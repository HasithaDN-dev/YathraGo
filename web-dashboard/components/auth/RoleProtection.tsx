"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAuthenticatedUser, hasRoutePermission, getRequiredRole, getRoleDisplayName, getDefaultRouteForRole, type UserRole } from '@/lib/rbac';

interface RoleProtectionProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function RoleProtection({ children, requiredRole }: RoleProtectionProps) {
  const [user, setUser] = useState<{ role: UserRole } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuthorization = () => {
      const authenticatedUser = getAuthenticatedUser();
      
      if (!authenticatedUser) {
        // User not authenticated - redirect to login
        router.push('/login');
        return;
      }

      setUser(authenticatedUser);

      // Check if user has permission for current route
      const hasPermission = requiredRole 
        ? authenticatedUser.role === requiredRole
        : hasRoutePermission(authenticatedUser.role, pathname);

      setIsAuthorized(hasPermission);
      setIsLoading(false);
    };

    checkAuthorization();
  }, [pathname, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized && user) {
    const requiredRoleForRoute = requiredRole || getRequiredRole(pathname);
    const userRoleDisplay = getRoleDisplayName(user.role);
    const requiredRoleDisplay = requiredRoleForRoute ? getRoleDisplayName(requiredRoleForRoute) : 'Unknown';

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Warning Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            
            <div className="space-y-3 mb-8">
              <p className="text-gray-600">
                You do not have permission to access this page.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Your Role:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {userRoleDisplay}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Required Role:</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                    {requiredRoleDisplay}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  const defaultRoute = getDefaultRouteForRole(user.role);
                  router.push(defaultRoute);
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Go to My Dashboard</span>
              </Button>
              
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </Button>
              
              <Button
                onClick={() => router.push('/')}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-800"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: UserRole
) {
  return function ProtectedComponent(props: P) {
    return (
      <RoleProtection requiredRole={requiredRole}>
        <Component {...props} />
      </RoleProtection>
    );
  };
}