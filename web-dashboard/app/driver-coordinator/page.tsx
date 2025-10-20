"use client";

import React from 'react';
import Link from 'next/link';
import { Card } from '../../components/ui/card';
import {
  UserCheck,
  Car,
  MessageSquare,
  AlertTriangle,
  Clock,
  Users,
  Shield,
  ChevronRight
} from 'lucide-react';

export default function DriverCoordinatorDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver Coordinator Dashboard</h1>
        <p className="text-gray-600">Manage driver verification, vehicle approval, and safety monitoring</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Verification</p>
              <p className="text-3xl font-bold text-blue-600">12</p>
              <p className="text-xs text-gray-500 mt-1"> 3 this week</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Drivers</p>
              <p className="text-3xl font-bold text-green-600">247</p>
              <p className="text-xs text-gray-500 mt-1"> 8 this month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Safety Alerts</p>
              <p className="text-3xl font-bold text-red-600">5</p>
              <p className="text-xs text-gray-500 mt-1"> 2 from last week</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Vehicle Approvals</p>
              <p className="text-3xl font-bold text-orange-600">8</p>
              <p className="text-xs text-gray-500 mt-1">Pending review</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/driver-coordinator/manage-drivers">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Manage Drivers</h3>
            <p className="text-sm text-gray-600 mb-3">Verify new drivers and monitor active drivers</p>
            <div className="flex items-center text-sm text-blue-600">
              <span>12 pending verification</span>
            </div>
          </Card>
        </Link>

        <Link href="/driver-coordinator/approve-vehicles">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-orange-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Approve Vehicles</h3>
            <p className="text-sm text-gray-600 mb-3">Review vehicle documents and approve registrations</p>
            <div className="flex items-center text-sm text-orange-600">
              <span>8 awaiting approval</span>
            </div>
          </Card>
        </Link>

        <Link href="/driver-coordinator/driver-inquiries">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Driver Inquiries</h3>
            <p className="text-sm text-gray-600 mb-3">Handle driver complaints and support requests</p>
            <div className="flex items-center text-sm text-purple-600">
              <span>3 new inquiries</span>
            </div>
          </Card>
        </Link>

        <Link href="/driver-coordinator/alerts">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Safety Alerts</h3>
            <p className="text-sm text-gray-600 mb-3">Monitor and respond to safety alerts</p>
            <div className="flex items-center text-sm text-red-600">
              <span>5 active alerts</span>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
