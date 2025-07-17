"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Users, 
  CreditCard, 
  AlertCircle, 
  Plus,
  Eye,
  UserPlus
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  textColor?: string;
}

interface ActivityEntry {
  description: string;
  status: "Completed" | "Paid" | "Pending";
  timestamp: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  bgColor, 
  textColor = "text-white" 
}) => (
  <Card className={`${bgColor} border-none shadow-md`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className={`text-sm font-medium ${textColor}`}>
        {title}
      </CardTitle>
      <div className={textColor}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${textColor}`}>
        {value}
      </div>
    </CardContent>
  </Card>
);

const ActivityBadge: React.FC<{ status: ActivityEntry["status"] }> = ({ status }) => {
  const statusStyles = {
    Completed: "bg-green-100 text-green-600",
    Paid: "bg-green-100 text-green-600",
    Pending: "bg-yellow-100 text-yellow-600"
  };

  return (
    <Badge variant="secondary" className={statusStyles[status]}>
      {status}
    </Badge>
  );
};

export default function OwnerDashboard() {
  // Mock data - replace with actual data fetching
  const ownerName = "John Doe";
  const stats = {
    totalVehicles: 12,
    totalDrivers: 8,
    monthlyEarnings: "₹45,320",
    pendingPayments: 3
  };

  const recentActivities: ActivityEntry[] = [
    {
      description: "Vehicle ABC-123 completed route to Downtown",
      status: "Completed",
      timestamp: "2 hours ago"
    },
    {
      description: "Driver payment processed for Week 28",
      status: "Paid",
      timestamp: "4 hours ago"
    },
    {
      description: "New booking request from Mobile App",
      status: "Pending",
      timestamp: "6 hours ago"
    },
    {
      description: "Vehicle maintenance completed for XYZ-789",
      status: "Completed",
      timestamp: "1 day ago"
    },
    {
      description: "Fuel payment pending for vehicle DEF-456",
      status: "Pending",
      timestamp: "1 day ago"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {ownerName}
        </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s an overview of your fleet operations
        </p>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Vehicles"
            value={stats.totalVehicles}
            icon={<Truck className="h-6 w-6" />}
            bgColor="bg-blue-600"
            textColor="text-white"
          />
          
          <StatCard
            title="Total Drivers"
            value={stats.totalDrivers}
            icon={<Users className="h-6 w-6" />}
            bgColor="bg-green-600"
            textColor="text-white"
          />
          
          <StatCard
            title="Monthly Earnings"
            value={stats.monthlyEarnings}
            icon={<CreditCard className="h-6 w-6" />}
            bgColor="bg-purple-600"
            textColor="text-white"
          />
          
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={<AlertCircle className="h-6 w-6" />}
            bgColor="bg-red-600"
            textColor="text-white"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Vehicle
            </Button>
            
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white font-medium"
              size="lg"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add Driver
            </Button>
            
            <Button 
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              size="lg"
            >
              <Eye className="h-5 w-5 mr-2" />
              View Payments
            </Button>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">
                    {activity.description}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {activity.timestamp}
                  </p>
                </div>
                <ActivityBadge status={activity.status} />
              </div>
            ))}
          </div>
          
          {recentActivities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No recent activity to display
              </p>
            </div>
          )}
        </div>
    </div>
  );
}
