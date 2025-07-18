import { CheckCircle, Calendar, Clock } from "lucide-react";
import Link from "next/link";

export default function BackupStatus() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Latest Backups</h3>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">2025-07-14 06:00 AM</span>
        </div>
      </div>

      <div className="space-y-4 flex-grow">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Last Backup Date:</span>
          <span className="text-sm text-gray-900">2025-07-14 06:00 AM</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Success</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/backup">
          <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
            Go to Backup & Recovery
          </button>
        </Link>
      </div>
    </div>
  );
}
