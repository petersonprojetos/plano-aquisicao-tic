"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FileText,
  CheckCircle,
  XCircle,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";
import type { Notification } from "./notifications-dropdown";

interface NotificationItemProps {
  notification: Notification;
  onNotificationClick: (notificationId: string) => void;
}

const iconMap: { [key: string]: React.ElementType } = {
  REQUEST_CREATED: FileText,
  REQUEST_APPROVED: CheckCircle,
  REQUEST_REJECTED: XCircle,
  REQUEST_RETURNED: RefreshCcw,
  default: AlertTriangle,
};

const iconColorMap: { [key: string]: string } = {
  REQUEST_CREATED: "text-blue-500",
  REQUEST_APPROVED: "text-green-500",
  REQUEST_REJECTED: "text-red-500",
  REQUEST_RETURNED: "text-orange-500",
  default: "text-yellow-500",
};

export function NotificationItem({
  notification,
  onNotificationClick,
}: NotificationItemProps) {
  const router = useRouter();

  const handleClick = async () => {
    if (!notification.isRead) {
      try {
        await fetch(`/api/notifications/${notification.id}/mark-as-read`, {
          method: "POST",
        });
        onNotificationClick(notification.id);
      } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error);
      }
    }
    if (notification.requestId) {
      router.push(`/dashboard/solicitacoes?requestId=${notification.requestId}`);
    }
  };

  const Icon = iconMap[notification.type] || iconMap.default;
  const iconColor = iconColorMap[notification.type] || iconColorMap.default;

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-start p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
        !notification.isRead && "bg-blue-50 dark:bg-blue-900/20"
      )}
    >
      <Icon className={cn("h-5 w-5 mt-1 flex-shrink-0", iconColor)} />
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{notification.title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {new Date(notification.createdAt).toLocaleString("pt-BR")}
        </p>
      </div>
      {!notification.isRead && (
        <div className="h-2.5 w-2.5 rounded-full bg-blue-500 self-center ml-2"></div>
      )}
    </div>
  );
}