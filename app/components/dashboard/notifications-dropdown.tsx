"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./notification-item";
import { toast } from "sonner";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  requestId: string | null;
}

export function NotificationsDropdown() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (status !== "authenticated" || !session) return;

    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Polling para novas notificações a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [session]);

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-as-read", {
        method: "POST",
      });

      if (response.ok) {
        setNotifications(
          notifications.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
        toast.success("Todas as notificações foram marcadas como lidas.");
      } else {
        toast.error("Erro ao marcar notificações como lidas.");
      }
    } catch (error) {
      console.error("Erro ao marcar notificações como lidas:", error);
      toast.error("Erro ao marcar notificações como lidas.");
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      // Atualiza o estado localmente para uma resposta de UI mais rápida
      const updatedNotifications = notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      setNotifications(updatedNotifications);
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));

      // Marca a notificação como lida no servidor
      await fetch(`/api/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-100"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end" sideOffset={5}>
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Notificações</h4>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            <div className="p-0">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onNotificationClick={handleNotificationClick}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center text-sm text-gray-500 p-8 h-full">
              <p>Nenhuma notificação encontrada</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}