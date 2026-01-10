import type {
  NotificationPayload,
  NotificationResponse,
  NotificationSettings,
  NotificationToken,
  StoredNotification,
} from "@/types/notification.types";
import notificationService from "../services/notification.service";

export {
  notificationService,
  // Tipos
  type NotificationPayload,
  type NotificationResponse,
  type NotificationSettings,
  type NotificationToken,
  type StoredNotification,
};

export const setupNotifications = async () => {
  return notificationService.requestPermissions();
};

export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>
) => {
  return notificationService.scheduleLocalNotification({
    title,
    body,
    data,
  });
};
