// Role-based authentication utilities
export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'FINANCE_MANAGER' | 'DRIVER_COORDINATOR';

export interface AuthenticatedUser {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

// Role to route mapping - defines which routes each role can access
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  OWNER: ['/owner', '/owner/**'],
  ADMIN: ['/admin', '/admin/**'],
  MANAGER: ['/manager', '/manager/**'],
  FINANCE_MANAGER: ['/finance-manager', '/finance-manager/**'],
  DRIVER_COORDINATOR: ['/driver-coordinator', '/driver-coordinator/**'],
};

// Route to role mapping - defines which role is required for each route
export const ROUTE_ROLES: Record<string, UserRole> = {
  '/owner': 'OWNER',
  '/admin': 'ADMIN',
  '/manager': 'MANAGER',
  '/finance-manager': 'FINANCE_MANAGER',
  '/driver-coordinator': 'DRIVER_COORDINATOR',
};

/**
 * Get the authenticated user from storage
 */
export function getAuthenticatedUser(): AuthenticatedUser | null {
  try {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    
    const user = JSON.parse(stored);
    
    // Validate that user has required fields
    if (!user.id || !user.email || !user.role) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      username: user.username || user.email.split('@')[0],
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  } catch {
    return null;
  }
}

/**
 * Check if a user has permission to access a specific route
 */
export function hasRoutePermission(userRole: UserRole, pathname: string): boolean {
  // Allow access to public routes
  const publicRoutes = ['/', '/login', '/signup'];
  if (publicRoutes.includes(pathname)) {
    return true;
  }

  // Check if route requires specific role
  for (const [routePattern, requiredRole] of Object.entries(ROUTE_ROLES)) {
    if (pathname.startsWith(routePattern)) {
      return userRole === requiredRole;
    }
  }

  // Allow access to routes not explicitly protected
  return true;
}

/**
 * Get the required role for a given route
 */
export function getRequiredRole(pathname: string): UserRole | null {
  for (const [routePattern, requiredRole] of Object.entries(ROUTE_ROLES)) {
    if (pathname.startsWith(routePattern)) {
      return requiredRole;
    }
  }
  return null;
}

/**
 * Get user-friendly role name
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    OWNER: 'Owner',
    ADMIN: 'Administrator',
    MANAGER: 'Manager',
    FINANCE_MANAGER: 'Finance Manager',
    DRIVER_COORDINATOR: 'Driver Coordinator',
  };
  
  return displayNames[role] || role;
}

/**
 * Get the default route for a user role
 */
export function getDefaultRouteForRole(role: UserRole): string {
  const defaultRoutes: Record<UserRole, string> = {
    OWNER: '/owner',
    ADMIN: '/admin',
    MANAGER: '/manager',
    FINANCE_MANAGER: '/finance-manager',
    DRIVER_COORDINATOR: '/driver-coordinator',
  };
  
  return defaultRoutes[role] || '/';
}

/**
 * Check if user is authenticated and has valid role
 */
export function isAuthenticated(): boolean {
  const user = getAuthenticatedUser();
  return user !== null;
}

/**
 * Get accessible navigation items for a user role
 */
export function getAccessibleNavItems(userRole: UserRole): Array<{href: string, label: string}> {
  const navItems: Record<UserRole, Array<{href: string, label: string}>> = {
    OWNER: [{ href: '/owner', label: 'Owner' }],
    ADMIN: [{ href: '/admin', label: 'Admin' }],
    MANAGER: [{ href: '/manager', label: 'Manager' }],
    FINANCE_MANAGER: [{ href: '/finance-manager', label: 'Finance Manager' }],
    DRIVER_COORDINATOR: [{ href: '/driver-coordinator', label: 'Driver Coordinator' }],
  };
  
  return navItems[userRole] || [];
}