"use client";

import { useState, useEffect } from 'react';
import { getAuthenticatedUser, getRoleDisplayName, getDefaultRouteForRole, type UserRole } from '@/lib/rbac';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function RoleTestPage() {
  const [user, setUser] = useState<{role: UserRole, email: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const authenticatedUser = getAuthenticatedUser();
    if (authenticatedUser) {
      setUser({
        role: authenticatedUser.role,
        email: authenticatedUser.email
      });
    }
  }, []);

  const testRoleAccess = (role: UserRole) => {
    const route = getDefaultRouteForRole(role);
    router.push(route);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Role Test Page</h1>
          <p className="text-gray-600 mb-4">Please log in to test role-based access.</p>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md mb-6">
          <h1 className="text-3xl font-bold mb-4">Role-Based Access Control Test</h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Current User</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {getRoleDisplayName(user.role)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Owner Dashboard</h3>
              <p className="text-sm text-gray-600 mb-3">Vehicle management, driver oversight</p>
              <Button 
                onClick={() => testRoleAccess('OWNER')}
                variant={user.role === 'OWNER' ? 'default' : 'outline'}
                className="w-full"
              >
                {user.role === 'OWNER' ? 'Access Dashboard' : 'Test Access (Should Deny)'}
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Admin Dashboard</h3>
              <p className="text-sm text-gray-600 mb-3">System administration, user management</p>
              <Button 
                onClick={() => testRoleAccess('ADMIN')}
                variant={user.role === 'ADMIN' ? 'default' : 'outline'}
                className="w-full"
              >
                {user.role === 'ADMIN' ? 'Access Dashboard' : 'Test Access (Should Deny)'}
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Manager Dashboard</h3>
              <p className="text-sm text-gray-600 mb-3">Reports, complaints, notifications</p>
              <Button 
                onClick={() => testRoleAccess('MANAGER')}
                variant={user.role === 'MANAGER' ? 'default' : 'outline'}
                className="w-full"
              >
                {user.role === 'MANAGER' ? 'Access Dashboard' : 'Test Access (Should Deny)'}
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Finance Manager</h3>
              <p className="text-sm text-gray-600 mb-3">Payments, payouts, financial reports</p>
              <Button 
                onClick={() => testRoleAccess('FINANCE_MANAGER')}
                variant={user.role === 'FINANCE_MANAGER' ? 'default' : 'outline'}
                className="w-full"
              >
                {user.role === 'FINANCE_MANAGER' ? 'Access Dashboard' : 'Test Access (Should Deny)'}
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Driver Coordinator</h3>
              <p className="text-sm text-gray-600 mb-3">Driver verification, vehicle approval</p>
              <Button 
                onClick={() => testRoleAccess('DRIVER_COORDINATOR')}
                variant={user.role === 'DRIVER_COORDINATOR' ? 'default' : 'outline'}
                className="w-full"
              >
                {user.role === 'DRIVER_COORDINATOR' ? 'Access Dashboard' : 'Test Access (Should Deny)'}
              </Button>
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-600">
            <h3 className="font-semibold mb-2">Testing Instructions:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Your assigned role should allow access to its corresponding dashboard</li>
              <li>Attempting to access other role dashboards should show an &quot;Access Denied&quot; warning</li>
              <li>The navigation bar should only show your authorized role in the dropdown</li>
              <li>Use different accounts with different roles to test the complete system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}