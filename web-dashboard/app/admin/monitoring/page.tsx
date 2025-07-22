"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Server,
  Database,
  Zap,
  Clock,
  Circle,
  Settings,
  Bell
} from "lucide-react";export default function SystemMonitoringPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [memoryWarning, setMemoryWarning] = useState("80");
  const [apiLatencyMax, setApiLatencyMax] = useState("200");
  const [storageSpaceLow, setStorageSpaceLow] = useState("15");

  const systemStats = [
    {
      title: "Server Status",
      value: "Online",
      icon: Server,
      status: "success",
      indicator: "green"
    },
    {
      title: "Database Health",
      value: "Connected",
      icon: Database,
      status: "success",
      indicator: "green"
    },
    {
      title: "API Latency",
      value: "120 ms",
      icon: Zap,
      status: "warning",
      indicator: "yellow"
    },
    {
      title: "Uptime",
      value: "99.98%",
      icon: Clock,
      status: "info",
      indicator: "blue"
    }
  ];

  const realtimeAlerts = [
    {
      time: "14:32",
      severity: "Critical",
      message: "API timeout from server-03",
      type: "critical"
    },
    {
      time: "13:50",
      severity: "Warning",
      message: "Memory usage > 80% on DB node-02",
      type: "warning"
    }
  ];

  const getStatusIcon = (indicator: string) => {
    switch (indicator) {
      case "green":
        return <Circle className="w-3 h-3 text-green-500 fill-current" />;
      case "yellow":
        return <Circle className="w-3 h-3 text-yellow-500 fill-current" />;
      case "blue":
        return <Circle className="w-3 h-3 text-blue-500 fill-current" />;
      default:
        return <Circle className="w-3 h-3 text-gray-500 fill-current" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return <Badge className="bg-red-100 text-red-800">● Critical</Badge>;
      case "Warning":
        return <Badge className="bg-yellow-100 text-yellow-800">● Warning</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <stat.icon className="w-8 h-8 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                {getStatusIcon(stat.indicator)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CPU Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">CPU Usage Chart</p>
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Memory Usage Chart</p>
            </div>
          </CardContent>
        </Card>

        {/* Network Traffic Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Network Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Network Traffic Chart</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Alerts and Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-Time Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Real-Time Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium text-gray-900 text-sm">Time</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-900 text-sm">Severity</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-900 text-sm">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {realtimeAlerts.map((alert, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-2 text-sm font-mono">{alert.time}</td>
                        <td className="py-3 px-2 text-sm">{getSeverityBadge(alert.severity)}</td>
                        <td className="py-3 px-2 text-sm">{alert.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Alert Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Email Notifications</span>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>

              {/* Threshold Configuration */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Threshold Configuration</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Memory % Warning
                    </label>
                    <Input
                      type="number"
                      value={memoryWarning}
                      onChange={(e) => setMemoryWarning(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      API Latency Max (ms)
                    </label>
                    <Input
                      type="number"
                      value={apiLatencyMax}
                      onChange={(e) => setApiLatencyMax(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Storage Space Low (%)
                    </label>
                    <Input
                      type="number"
                      value={storageSpaceLow}
                      onChange={(e) => setStorageSpaceLow(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Save Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
