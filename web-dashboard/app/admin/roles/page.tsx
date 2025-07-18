"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users,
  Plus,
  UserCheck,
  Settings
} from "lucide-react";

export default function RolePermissionManagementPage() {
  const [selectedRole, setSelectedRole] = useState("Staff Passengers");

  const roles = [
    { name: "Parents", userCount: 24 },
    { name: "Staff Passengers", userCount: 12 },
    { name: "Drivers", userCount: 8 },
    { name: "Owners", userCount: 3 },
    { name: "Admins", userCount: 2 },
    { name: "Managers", userCount: 5 },
    { name: "Driver Coordinators", userCount: 4 },
    { name: "Finance Managers", userCount: 2 },
  ];

  const permissions = [
    {
      module: "Dashboard Access",
      view: true,
      create: false,
      edit: false,
      delete: false
    },
    {
      module: "Trip Management",
      view: true,
      create: true,
      edit: true,
      delete: false
    },
    {
      module: "User Accounts",
      view: true,
      create: true,
      edit: true,
      delete: true
    },
    {
      module: "Vehicle Assignment",
      view: true,
      create: true,
      edit: false,
      delete: false
    }
  ];

  const [permissionMatrix, setPermissionMatrix] = useState(permissions);

  const handleRoleChange = (roleName: string) => {
    setSelectedRole(roleName);
    // You can add logic here to load different permissions for different roles
    // For now, we'll keep the same permissions but this can be expanded
  };

  const handlePermissionToggle = (moduleIndex: number, permissionType: string) => {
    setPermissionMatrix(prev => prev.map((item, index) => {
      if (index === moduleIndex) {
        return {
          ...item,
          [permissionType]: !item[permissionType as keyof typeof item]
        };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Role & Permission Management</h1>
        <p className="text-gray-600">Manage user roles and their permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Roles</span>
                </CardTitle>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roles.map((role, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedRole === role.name
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleRoleChange(role.name)}
                  >
                    <div className="flex flex-col">
                      <span className={`font-medium ${
                        selectedRole === role.name ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {role.name}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {role.userCount} users
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Matrix */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Permissions Matrix - {selectedRole}</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Clone Existing Role
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Assign Role to User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Module / Feature
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        View
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Create
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Edit
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissionMatrix.map((permission, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">
                          {permission.module}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={permission.view}
                            onCheckedChange={() => handlePermissionToggle(index, 'view')}
                            className="data-[state=checked]:bg-green-500"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={permission.create}
                            onCheckedChange={() => handlePermissionToggle(index, 'create')}
                            className="data-[state=checked]:bg-green-500"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={permission.edit}
                            onCheckedChange={() => handlePermissionToggle(index, 'edit')}
                            className="data-[state=checked]:bg-green-500"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={permission.delete}
                            onCheckedChange={() => handlePermissionToggle(index, 'delete')}
                            className="data-[state=checked]:bg-green-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
