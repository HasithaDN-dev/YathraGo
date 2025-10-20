import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  textColor?: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  bgColor, 
  textColor = "text-white",
  subtitle
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
      {subtitle && (
        <p className={`text-xs mt-1 ${textColor} opacity-90`}>
          {subtitle}
        </p>
      )}
    </CardContent>
  </Card>
);
