"use client";
import React from 'react';
import { Card } from '../../../components/ui/card';

export default function RemoveDriversPage() {
  const drivers = [
    { id: 'DRV-100', name: 'Kamal', reason: 'Multiple complaints' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Remove Drivers</h1>
      <div className="space-y-3">
        {drivers.map(d => (
          <Card key={d.id}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{d.name}</div>
                <div className="text-sm text-muted-foreground">{d.reason}</div>
              </div>
              <div>
                <button className="btn btn-destructive mr-2">Remove</button>
                <button className="btn">Suspend</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
