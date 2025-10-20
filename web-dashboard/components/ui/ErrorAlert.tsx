import React from "react";
import { AlertCircle, X, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  type?: "error" | "warning" | "success" | "info";
  onDismiss?: () => void;
  title?: string;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  type = "error",
  onDismiss,
  title,
  className = "",
}) => {
  const config = {
    error: {
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      iconColor: "text-red-600",
      icon: AlertCircle,
      defaultTitle: "Error",
    },
    warning: {
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
      iconColor: "text-yellow-600",
      icon: AlertTriangle,
      defaultTitle: "Warning",
    },
    success: {
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      iconColor: "text-green-600",
      icon: CheckCircle,
      defaultTitle: "Success",
    },
    info: {
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      iconColor: "text-blue-600",
      icon: Info,
      defaultTitle: "Information",
    },
  };

  const { bgColor, borderColor, textColor, iconColor, icon: Icon, defaultTitle } = config[type];

  return (
    <div
      className={`${bgColor} ${borderColor} border rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <Icon className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} />
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-semibold ${textColor} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${textColor}`}>
            {message || defaultTitle}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`ml-3 ${textColor} hover:opacity-70 flex-shrink-0`}
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
