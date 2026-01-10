import React, { createContext, ReactNode, useContext } from "react";
import { useNotifications } from "../hooks/useNotifications";
import {
  NotificationResponse,
  NotificationSettings,
  StoredNotification,
} from "../types/notification.types";

interface NotificationContextType {
  // Estado
  token: string | null;
  permissionGranted: boolean;
  settings: NotificationSettings | null;
  history: StoredNotification[];
  loading: boolean;
  hasToken: boolean;
  unreadCount: number;
  lastNotification: NotificationResponse | null;

  // Métodos
  initialize: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  sendNotification: (
    title: string,
    body: string,
    data?: Record<string, any>,
    trigger?: any
  ) => Promise<string>;
  sendPushNotification: (
    toToken: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ) => Promise<boolean>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<boolean>;
  markAsRead: (notificationId: string) => Promise<void>;
  cancelNotification: (notificationId: string) => Promise<void>;
  clearBadge: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const notification = useNotifications();

  return (
    <NotificationContext.Provider value={notification}>
      {children}
    </NotificationContext.Provider>
  );
};
