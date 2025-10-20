import React from 'react'

export const metadata = {
  title: 'Driver Alerts',
}

export default function DriverAlertsPage() {
  const alerts = [
    {
      id: 1,
      type: 'Safety',
      severity: 'High',
      driverName: 'John Doe',
      driverId: 'D001',
      vehicle: 'CAB-1234',
      message: 'Speeding violation detected on Route A',
      timestamp: '2025-10-19 09:30 AM',
      status: 'Active'
    },
    {
      id: 2,
      type: 'Compliance',
      severity: 'Medium',
      driverName: 'Jane Smith',
      driverId: 'D002',
      vehicle: 'VAN-5678',
      message: 'License expiry reminder - expires in 30 days',
      timestamp: '2025-10-19 08:15 AM',
      status: 'Pending'
    },
    {
      id: 3,
      type: 'Incident',
      severity: 'High',
      driverName: 'Mike Johnson',
      driverId: 'D003',
      vehicle: 'BUS-9012',
      message: 'Vehicle breakdown reported on Highway 1',
      timestamp: '2025-10-19 07:45 AM',
      status: 'Resolved'
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'text-red-600 bg-red-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-red-600 bg-red-100'
      case 'Pending': return 'text-yellow-600 bg-yellow-100'
      case 'Resolved': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Alert Handling</h1>
        <p className="text-gray-600">Monitor and manage driver alerts, safety violations, and incidents</p>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Total Alerts</div>
          <div className="text-2xl font-bold text-gray-900">12</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">High Priority</div>
          <div className="text-2xl font-bold text-red-600">3</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">5</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Resolved Today</div>
          <div className="text-2xl font-bold text-green-600">7</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <select className="border border-gray-300 rounded px-3 py-2">
            <option>All Types</option>
            <option>Safety</option>
            <option>Compliance</option>
            <option>Incident</option>
          </select>
          <select className="border border-gray-300 rounded px-3 py-2">
            <option>All Severity</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select className="border border-gray-300 rounded px-3 py-2">
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Resolved</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Apply Filters
          </button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Clear
          </button>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Driver Alerts</h2>
            <div className="flex gap-2">
              <button className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                Resolve Selected
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Export Report
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input type="checkbox" className="mr-2" />
                  Alert
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input type="checkbox" className="mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">{alert.type}</div>
                      <div className="text-sm text-gray-500">{alert.message}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{alert.driverName}</div>
                    <div className="text-sm text-gray-500">ID: {alert.driverId}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{alert.vehicle}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{alert.timestamp}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      <button className="text-green-600 hover:text-green-800 text-sm">Resolve</button>
                      <button className="text-yellow-600 hover:text-yellow-800 text-sm">Escalate</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
