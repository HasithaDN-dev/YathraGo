import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  badge?: string;
  badgeColor?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  href,
  title,
  description,
  icon: Icon,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-600",
  badge,
  badgeColor = "text-blue-600"
}) => (
  <Link href={href}>
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
      <div className="flex items-center mb-3">
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center mr-4`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      {badge && (
        <div className={`text-sm ${badgeColor} mt-2`}>
          {badge} →
        </div>
      )}
    </Card>
  </Link>
);
