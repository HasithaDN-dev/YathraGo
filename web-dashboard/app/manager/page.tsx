"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Eye,
  UserCheck,
  Car,
  FileText,
  Megaphone,
  MessageSquare,
  TrendingUp,
  Clock
} from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  textColor?: string;
}

interface ActivityEntry {
  description: string;
  status: "Approved" | "Verified" | "Pending" | "Resolved" | "Published";
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

const ActivityItem: React.FC<{ activity: ActivityEntry }> = ({ activity }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex-1">
      <p className="text-sm text-[var(--color-deep-navy)]">
        {activity.description}
      </p>
      <p className="text-xs text-[var(--neutral-gray)]">
        {activity.timestamp}
      </p>
    </div>
    <Badge 
      variant="secondary" 
      className={`${
        activity.status === "Approved" || activity.status === "Verified" || activity.status === "Resolved" || activity.status === "Published"
          ? "bg-[var(--success-bg)] text-[var(--success-green)]"
          : "bg-[var(--warm-yellow)]/20 text-[var(--warning-amber)]"
      }`}
    >
      {activity.status}
    </Badge>
  </div>
);

export default function ManagerDashboard() {
  const stats = [
    {
      title: "Pending Vehicle Approvals",
      value: "12",
      icon: <Car className="w-4 h-4" />,
      bgColor: "bg-[var(--bright-orange)]"
    },
    {
      title: "Driver Verifications",
      value: "8",
      icon: <Users className="w-4 h-4" />,
      bgColor: "bg-[var(--color-deep-navy)]"
    },
    {
      title: "Monthly Revenue",
      value: "Rs 2,45,000",
      icon: <DollarSign className="w-4 h-4" />,
      bgColor: "bg-[var(--success-green)]"
    },
    {
      title: "Open Complaints",
      value: "5",
      icon: <AlertTriangle className="w-4 h-4" />,
      bgColor: "bg-[var(--error-red)]"
    }
  ];

  const recentActivities: ActivityEntry[] = [
    {
      description: "Approved vehicle registration for ABC-456",
      status: "Approved",
      timestamp: "2 hours ago"
    },
    {
      description: "Verified driver license for John Doe",
      status: "Verified",
      timestamp: "4 hours ago"
    },
    {
      description: "Published safety notice for all drivers",
      status: "Published",
      timestamp: "1 day ago"
    },
    {
      description: "Resolved complaint about route timing",
      status: "Resolved",
      timestamp: "1 day ago"
    },
    {
      description: "Vehicle DEF-789 approval pending documentation",
      status: "Pending",
      timestamp: "2 days ago"
    }
  ];

  const quickActions = [
    {
      title: "Approve Vehicles",
      description: "Review and approve new vehicle registrations",
      href: "/manager/approve-vehicles",
      icon: <Car className="w-5 h-5" />,
      color: "border-[var(--bright-orange)] text-[var(--bright-orange)]"
    },
    {
      title: "Verify Drivers",
      description: "Verify driver credentials and background checks",
      href: "/manager/verify-drivers",
      icon: <UserCheck className="w-5 h-5" />,
      color: "border-[var(--color-deep-navy)] text-[var(--color-deep-navy)]"
    },
    {
      title: "Revenue Management",
      description: "Monitor and manage fleet revenue streams",
      href: "/manager/revenue-management",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "border-[var(--success-green)] text-[var(--success-green)]"
    },
    {
      title: "Generate Reports",
      description: "Create comprehensive management reports",
      href: "/manager/generate-reports",
      icon: <FileText className="w-5 h-5" />,
      color: "border-[var(--neutral-gray)] text-[var(--neutral-gray)]"
    },
    {
      title: "Publish Notices",
      description: "Send important notices to drivers and owners",
      href: "/manager/publish-notices",
      icon: <Megaphone className="w-5 h-5" />,
      color: "border-[var(--warm-yellow)] text-[var(--warning-amber)]"
    },
    {
      title: "Handle Complaints",
      description: "Review and resolve customer complaints",
      href: "/manager/handle-complaints",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "border-[var(--error-red)] text-[var(--error-red)]"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)] p-6">
        <h1 className="text-2xl font-bold text-[var(--color-deep-navy)]">
          Manager Dashboard
        </h1>
        <p className="text-[var(--neutral-gray)] mt-2">
          Oversee fleet operations, approvals, and manage system-wide activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bgColor={stat.bgColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border border-[var(--neutral-gray)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)]">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${action.color} hover:bg-gray-50`}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg bg-gray-50`}>
                            {action.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-[var(--color-deep-navy)] text-sm">
                              {action.title}
                            </h3>
                            <p className="text-xs text-[var(--neutral-gray)] mt-1">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="space-y-6">
          <Card className="shadow-sm border border-[var(--neutral-gray)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)]">
                Recent Activities
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="border-[var(--neutral-gray)] text-[var(--neutral-gray)] hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-1" />
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentActivities.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks Summary */}
          <Card className="shadow-sm border border-[var(--warning-amber)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--warning-amber)]" />
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--neutral-gray)]">Vehicle Approvals</span>
                  <Badge variant="secondary" className="bg-[var(--warm-yellow)]/20 text-[var(--warning-amber)]">
                    12 Pending
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--neutral-gray)]">Driver Verifications</span>
                  <Badge variant="secondary" className="bg-[var(--warm-yellow)]/20 text-[var(--warning-amber)]">
                    8 Pending
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--neutral-gray)]">Open Complaints</span>
                  <Badge variant="secondary" className="bg-[var(--error-bg)] text-[var(--error-red)]">
                    5 Open
                  </Badge>
                </div>
                <div className="pt-2">
                  <Button className="w-full bg-[var(--bright-orange)] hover:bg-[var(--warm-yellow)] text-white">
                    View All Tasks
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
