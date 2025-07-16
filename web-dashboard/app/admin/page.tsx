import DashboardStats from "@/components/admin/DashboardStats";
import RecentActivities from "@/components/admin/RecentActivities";
import SystemStatus from "@/components/admin/SystemStatus";
import BackupStatus from "@/components/admin/BackupStatus";
import ComplianceSnapshot from "@/components/admin/ComplianceSnapshot";
import ActiveRoles from "@/components/admin/ActiveRoles";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Live Trip Status Overview</h1>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* View Trip Monitor Button */}
      <div className="flex">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          View Trip Monitor
        </button>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Latest Backups */}
        <BackupStatus />

        {/* Compliance Snapshot */}
        <ComplianceSnapshot />

        {/* Recent Activities */}
        <RecentActivities />

        {/* Active Roles */}
        <ActiveRoles />

        {/* System Monitoring */}
        <SystemStatus />
      </div>
    </div>
  );
}
