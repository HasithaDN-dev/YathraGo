"use client";

import React, { useEffect, useState } from "react";
import { useOwner } from "@/components/owner/OwnerContext";
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
    Completed: "bg-[var(--success-bg)] text-[var(--success-green)]",
    Paid: "bg-[var(--success-bg)] text-[var(--success-green)]",
    Pending: "bg-[var(--warm-yellow)]/20 text-[var(--warning-amber)]"
  };

  return (
    <Badge variant="secondary" className={statusStyles[status]}>
      {status}
    </Badge>
  );
};

export default function OwnerDashboard() {
  const { firstName: ownerFirstName, lastName: ownerLastName } = useOwner();
  interface Vehicle {
    id: number;
    registrationNumber?: string | null;
    type: string;
    brand?: string | null;
    model?: string | null;
    no_of_seats?: number | null;
    status?: string | null;
    ownerId?: number | null;
  }

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoadingVehicles(true);
      try {
        const token = typeof document !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1] : undefined;
        const res = await fetch('http://localhost:3000/vehicles', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
        });
        if (!res.ok) {
          console.error('Failed to fetch vehicles', res.status);
          setVehicles([]);
          return;
        }
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching vehicles', err);
        setVehicles([]);
      } finally {
        setLoadingVehicles(false);
      }
    };

    void fetchVehicles();
  }, []);

  const stats = {
    totalVehicles: vehicles.length,
    totalDrivers: 8,
    monthlyEarnings: "Rs 45,320",
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
      <div className="bg-white rounded-lg shadow-sm border border-[var(--neutral-gray)] p-6">
        <h1 className="text-3xl font-bold text-[var(--color-deep-navy)]">
          Welcome, {ownerFirstName} {ownerLastName}
        </h1>
        <p className="text-[var(--neutral-gray)] mt-2">
          Here&apos;s an overview of your fleet operations, {ownerFirstName} {ownerLastName}
        </p>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Vehicles"
            value={stats.totalVehicles}
            icon={<Truck className="h-6 w-6" />}
            bgColor="bg-[var(--bright-orange)]"
            textColor="text-[var(--black)]"
          />
          
          <StatCard
            title="Total Drivers"
            value={stats.totalDrivers}
            icon={<Users className="h-6 w-6" />}
            bgColor="bg-[var(--success-green)]"
            textColor="text-white"
          />
          
          <StatCard
            title="Monthly Earnings"
            value={stats.monthlyEarnings}
            icon={<CreditCard className="h-6 w-6" />}
            bgColor="bg-[var(--color-deep-navy)]"
            textColor="text-white"
          />
          
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={<AlertCircle className="h-6 w-6" />}
            bgColor="bg-[var(--error-red)]"
            textColor="text-white"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/owner/add-vehicle">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Vehicle
              </Button>
            </Link>
            
            <Link href="/owner/add-driver">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white font-medium"
                size="lg"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Add Driver
              </Button>
            </Link>
            
            <Link href="/owner/vehicle-list">
              <Button 
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium"
                size="lg"
              >
                <Eye className="h-5 w-5 mr-2" />
                View Vehicles
              </Button>
            </Link>
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
                className="flex items-center justify-between p-4 border border-[var(--neutral-gray)] rounded-lg hover:bg-[var(--light-gray)] transition-colors"
              >
                <div className="flex-1">
                  <p className="text-[var(--color-deep-navy)] font-medium">
                    {activity.description}
                  </p>
                  <p className="text-[var(--neutral-gray)] text-sm mt-1">
                    {activity.timestamp}
                  </p>
                </div>
                <ActivityBadge status={activity.status} />
              </div>
            ))}
          </div>
          
          {recentActivities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[var(--neutral-gray)]">
                No recent activity to display
              </p>
            </div>
          )}
        </div>

        {/* Vehicles Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Vehicles</h2>

          {loadingVehicles ? (
            <div className="text-center py-12">Loading vehicles...</div>
          ) : vehicles.length === 0 ? (
            <p className="text-[var(--neutral-gray)]">No vehicles found for your account.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[var(--light-gray)] border-b border-[var(--neutral-gray)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">Vehicle No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--neutral-gray)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[var(--neutral-gray)]">
                  {vehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((v) => (
                    <tr key={v.id} className="hover:bg-[var(--light-gray)] transition-colors cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-deep-navy)]">{v.registrationNumber || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--neutral-gray)]">{v.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--neutral-gray)]">{v.no_of_seats ?? '—'} seats</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="px-2 py-1 rounded text-sm bg-[var(--light-gray)] text-[var(--neutral-gray)]">{v.status || 'Active'}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-[var(--bright-orange)] hover:text-[var(--warm-yellow)]">Edit</button>
                          <button className="text-[var(--neutral-gray)] hover:text-[var(--color-deep-navy)]">Details</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {Math.ceil(vehicles.length / itemsPerPage) > 1 && (
                <div className="px-6 py-3 border-t border-[var(--neutral-gray)]">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[var(--neutral-gray)]">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, vehicles.length)} of {vehicles.length} vehicles</div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-[var(--neutral-gray)] text-[var(--neutral-gray)] hover:bg-[var(--bright-orange)] hover:text-[var(--black)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Prev</button>
                      {Array.from({ length: Math.ceil(vehicles.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                        <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded-lg transition-colors ${currentPage === page ? 'bg-[var(--color-deep-navy)] text-white' : 'text-[var(--bright-orange)] hover:bg-[var(--color-deep-navy)] hover:text-white'}`}>{page}</button>
                      ))}
                      <button onClick={() => setCurrentPage(Math.min(Math.ceil(vehicles.length / itemsPerPage), currentPage + 1))} disabled={currentPage === Math.ceil(vehicles.length / itemsPerPage)} className="p-2 rounded-lg border border-[var(--neutral-gray)] text-[var(--neutral-gray)] hover:bg-[var(--bright-orange)] hover:text-[var(--black)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
}
