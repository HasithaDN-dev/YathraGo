import { Server, Database, Zap, Monitor } from "lucide-react";
import Link from "next/link";

export default function SystemStatus() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">System Monitoring</h3>
        <Monitor className="w-5 h-5 text-gray-500" />
      </div>

      <div className="space-y-4 flex-grow">
        {/* System Status Items */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Running</span>
            </div>
          </div>
          <span className="text-sm text-gray-600">Server</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Connected</span>
            </div>
          </div>
          <span className="text-sm text-gray-600">Database</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">200ms</span>
            </div>
          </div>
          <span className="text-sm text-gray-600">API Response</span>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/monitoring">
          <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
            Go to Monitoring
          </button>
        </Link>
      </div>
    </div>
  );
}
