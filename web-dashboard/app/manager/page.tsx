"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye, FileText, Megaphone, MessageSquare } from "lucide-react";
import { getNotices, Notice } from "@/lib/notices";
import Link from "next/link";
import { api } from "@/lib/api";

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
  const [complaintsStats, setComplaintsStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await api.complaints.getStatistics();
        setComplaintsStats(stats.overview);
      } catch (error) {
        console.error("Failed to fetch complaints statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      title: "Open Complaints",
      value: loading ? "..." : complaintsStats.pending,
      icon: <AlertTriangle className="w-4 h-4" />,
      bgColor: "bg-[var(--error-red)]"
    }
  ];

  const recentActivities: ActivityEntry[] = [
    
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
      description: "Open complaint: delayed pick-up at Oak St.",
      status: "Pending",
      timestamp: "2 days ago"
    }
  ];

  // Client state for live notices from backend (fallback to in-memory mocks)
  const [publishedNotices, setPublishedNotices] = useState<Notice[]>(() =>
    // initial: filter mock notices for web audience
    getNotices().filter(n => {
      const a = (n.audience || '').toLowerCase();
      return a === '' || a === 'all' || a === 'web';
    })
  );
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // call the dashboard proxy which forwards to backend
        const res = await fetch('/api/notices?userType=WEBUSER&userId=0');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();

        // backend may return wrapper { success,count,notifications } or an array
  type NoticeLike = Record<string, unknown>;
  let items: NoticeLike[] = [];
        if (Array.isArray(body)) items = body;
        else if (Array.isArray(body.notifications)) items = body.notifications;
        else if (Array.isArray(body.data)) items = body.data;
        else if (Array.isArray(body.result)) items = body.result;
        else if (body.payload && Array.isArray(body.payload.notifications)) items = body.payload.notifications;
        else if (body.notification && Array.isArray(body.notification)) items = body.notification;
        else {
          // try to coerce if single object
          items = Array.isArray(body) ? body : [];
        }

        // map to the same shape the mock uses (id,title,publishedAt,audience)
        const normalized: Notice[] = items.map((it: NoticeLike) => ({
          id: String((it.id ?? it._id ?? it.noticeId ?? '')),
          title: String(it.title ?? it.message ?? it.body ?? ''),
          body: String(it.body ?? it.message ?? ''),
          publishedAt: String(it.createdAt ?? it.publishedAt ?? it.created_at ?? new Date().toISOString()),
          audience: String(it.audience ?? it.receiver ?? ''),
        }));

        // keep only web-relevant notices
        const webOnly = normalized.filter(n => {
          const a = (n.audience || '').toLowerCase();
          return a === '' || a === 'all' || a === 'web';
        }).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        if (mounted) {
          setPublishedNotices(webOnly);
          setFetchError(null);
        }
      } catch (err: unknown) {
        console.debug('Failed to load notices from backend:', err);
        if (mounted) setFetchError(String((err as unknown as { message?: unknown })?.message ?? String(err)));
        // keep mock notices already set as initial state
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const quickActions = [
    {
      title: "Handle Complaints",
      description: "Review and resolve customer complaints",
      href: "/manager/handle-complaints",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "border-[var(--error-red)] text-[var(--error-red)]"
    },
    {
      title: "Manage Notifications",
      description: "Send important notifications to users or broadcast to a group",
      href: "/manager/manage-notifications",
      icon: <Megaphone className="w-5 h-5" />,
      color: "border-[var(--warm-yellow)] text-[var(--warning-amber)]"
    },
    {
      title: "Generate Reports",
      description: "Create comprehensive management reports",
      href: "/manager/generate-reports",
      icon: <FileText className="w-5 h-5" />,
      color: "border-[var(--neutral-gray)] text-[var(--neutral-gray)]"
    },
    {
      title: "Receive Alerts",
      description: "View and acknowledge incoming system alerts",
      href: "/manager/receive-alerts",
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "border-[var(--success-green)] text-[var(--success-green)]"
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
          Oversee fleet operations and manage system-wide activities
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

        {/* Right column: Notices then Recent Activities */}
        <div className="space-y-6">
          <Card className="shadow-sm border border-[var(--neutral-gray)]">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)]">Published Notices</CardTitle>
              <Link href="/manager/manage-notifications">
                <Button variant="outline" size="sm" className="border-[var(--neutral-gray)] text-[var(--neutral-gray)] hover:bg-gray-50">New</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fetchError ? (
                  <div className="text-xs text-[var(--error-red)]">Failed to load live notices: {fetchError}</div>
                ) : null}
                {publishedNotices.slice(0,3).map((n) => (
                  <div key={n.id} className="text-sm">
                    <div className="font-medium text-[var(--color-deep-navy)]">{n.title}</div>
                    <div className="text-xs text-[var(--neutral-gray)]">{new Date(n.publishedAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-[var(--neutral-gray)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-semibold text-[var(--color-deep-navy)]">
                Recent Activities
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="border-[var(--neutral-gray)] text-[var(--neutral-gray)] hover:bg-gray-50 hover:text-[var(--neutral-gray)]"
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
        </div>
      </div>
    </div>
  );
}
