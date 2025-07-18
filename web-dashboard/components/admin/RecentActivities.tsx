import { Circle, User, Database, Settings } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "driver",
    message: "Driver01 updated trip route",
    time: "2 mins ago",
    icon: User,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    id: 2,
    type: "admin",
    message: "Admin created role 'Finance Manager'",
    time: "15 mins ago",
    icon: Settings,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    id: 3,
    type: "system",
    message: "System backup completed",
    time: "1 hour ago",
    icon: Database,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
  },
  {
    id: 4,
    type: "user",
    message: "User permissions updated",
    time: "2 hours ago",
    icon: User,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
  },
];

export default function RecentActivities() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`${activity.iconBg} p-2 rounded-full`}>
              <activity.icon className={`w-3 h-3 ${activity.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
          View Full Logs
        </button>
      </div>
    </div>
  );
}
