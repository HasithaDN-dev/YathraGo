import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function ComplianceSnapshot() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Compliance Snapshot</h3>
      </div>

      <div className="space-y-4 flex-grow">
        {/* Compliance Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">3</div>
            <div className="text-xs text-gray-600">Compliant</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">1</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">0</div>
            <div className="text-xs text-gray-600">Failed</div>
          </div>
        </div>

        {/* Regulation Status */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Regulation at Risk:</span>
          </div>
          <div className="mt-2 p-3 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">ISO Transport 2023 - Expires in 3 days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/compliance">
          <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
            View Compliance
          </button>
        </Link>
      </div>
    </div>
  );
}
