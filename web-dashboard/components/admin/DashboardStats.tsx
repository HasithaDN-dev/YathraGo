import { Bus, CheckCircle, AlertTriangle, Users } from "lucide-react";

const stats = [
  {
    title: "Active Trips",
    value: "12",
    icon: Bus,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Completed Today",
    value: "38",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Delayed Trips",
    value: "2",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    title: "Absent Drivers",
    value: "1",
    icon: Users,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-full`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
