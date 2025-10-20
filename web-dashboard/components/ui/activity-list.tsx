import React from "react";
import { Badge } from "@/components/ui/badge";

export type ActivityStatus = 
  | "Approved" 
  | "Verified" 
  | "Pending" 
  | "Resolved" 
  | "Published"
  | "Completed"
  | "Paid"
  | "In Progress";

interface ActivityEntry {
  description: string;
  status: ActivityStatus;
  timestamp: string;
  amount?: string;
}

interface ActivityListProps {
  activities: ActivityEntry[];
}

const getStatusStyle = (status: ActivityStatus): string => {
  switch (status) {
    case "Approved":
    case "Verified":
    case "Resolved":
    case "Published":
    case "Completed":
    case "Paid":
      return "bg-[var(--success-bg)] text-[var(--success-green)]";
    case "In Progress":
      return "bg-blue-100 text-blue-700";
    case "Pending":
    default:
      return "bg-[var(--warm-yellow)]/20 text-[var(--warning-amber)]";
  }
};

export const ActivityItem: React.FC<{ activity: ActivityEntry }> = ({ activity }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex-1">
      <p className="text-sm text-[var(--color-deep-navy)]">
        {activity.description}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-xs text-[var(--neutral-gray)]">
          {activity.timestamp}
        </p>
        {activity.amount && (
          <span className="text-xs font-medium text-[var(--color-deep-navy)]">
            • {activity.amount}
          </span>
        )}
      </div>
    </div>
    <Badge variant="secondary" className={getStatusStyle(activity.status)}>
      {activity.status}
    </Badge>
  </div>
);

export const ActivityList: React.FC<ActivityListProps> = ({ activities }) => (
  <div className="space-y-2">
    {activities.map((activity, index) => (
      <ActivityItem key={index} activity={activity} />
    ))}
  </div>
);
