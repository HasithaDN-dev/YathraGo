import { Users, UserCheck } from "lucide-react";

export default function ActiveRoles() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Roles</h3>
        <Users className="w-5 h-5 text-gray-500" />
      </div>

      <div className="space-y-4">
        {/* Role Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">8</div>
            <div className="text-sm text-gray-600">Roles Defined</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">156</div>
            <div className="text-sm text-gray-600">Users Assigned</div>
          </div>
        </div>

        <div className="mt-6">
          <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
            Manage Roles & Permissions
          </button>
        </div>
      </div>
    </div>
  );
}
