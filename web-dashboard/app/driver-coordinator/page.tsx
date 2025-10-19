"use client";
import React from 'react';
import { Card } from '../../components/ui/card';

export default function DriverCoordinatorDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Driver Coordinator Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <h2 className="text-lg font-medium">Verify Drivers</h2>
          <p className="text-sm text-muted-foreground">Review driver documents and approve verification.</p>
        </Card>
        <Card>
          <h2 className="text-lg font-medium">Approve Vehicles</h2>
          <p className="text-sm text-muted-foreground">Approve vehicle registrations and checks.</p>
        </Card>
        <Card>
          <h2 className="text-lg font-medium">Driver Inquiries</h2>
          <p className="text-sm text-muted-foreground">View and respond to driver complaints and inquiries.</p>
        </Card>
      </div>

      <section className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Pending Driver Verifications (mock)</h3>
        <div className="space-y-2">
          <Card>
            <div className="flex justify-between">
              <div>
                <div className="font-medium">Driver: Ramesh</div>
                <div className="text-sm text-muted-foreground">NIC: 123456789V</div>
              </div>
              <div className="text-right">
                <button className="btn btn-primary mr-2">Approve</button>
                <button className="btn">Reject</button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
