import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import { Alert, Platform, View } from "react-native";
import { useNotificationContext } from "./NotificationContext";

interface NotificationHandlerProps {
  onNotificationTap?: (data: any) => void;
  showAlerts?: boolean;
}

export const NotificationHandler: React.FC<NotificationHandlerProps> = ({
  onNotificationTap,
  showAlerts = true,
}) => {
  const { lastNotification, markAsRead, clearBadge } = useNotificationContext();
  const [initialized, setInitialized] = useState(false);

  // Configurar notificações
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Configurar comportamento para iOS
        if (Platform.OS === "ios") {
          await Notifications.setNotificationCategoryAsync("default", [
            {
              identifier: "view",
              buttonTitle: "Ver",
              options: {
                opensAppToForeground: true,
              },
            },
            {
              identifier: "later",
              buttonTitle: "Lembrar mais tarde",
              options: {
                opensAppToForeground: false,
              },
            },
          ]);
        }

        setInitialized(true);
        console.log("🎯 NotificationHandler configurado");
      } catch (error) {
        console.error("❌ Erro ao configurar NotificationHandler:", error);
      }
    };

    setupNotifications();

    clearBadge();
  }, [clearBadge]);

  useEffect(() => {
    if (lastNotification && initialized) {
      const { notification, actionIdentifier } = lastNotification;

      // Marcar como lida
      if (notification.request.identifier) {
        markAsRead(notification.request.identifier);
      }

      if (onNotificationTap) {
        onNotificationTap({
          ...notification,
          action: actionIdentifier,
          data: notification.request.content.data,
        });
      }

      if (showAlerts && actionIdentifier === "view") {
        Alert.alert(
          notification.request.content.title || "Notificação",
          notification.request.content.body || "Notificação",
          [
            {
              text: "OK",
              style: "default",
            },
          ]
        );
      }

      console.log("👆 Notificação tocada:", {
        title: notification.request.content.title,
        action: actionIdentifier,
        data: notification.request.content.data,
      });
    }
  }, [
    lastNotification,
    initialized,
    onNotificationTap,
    showAlerts,
    markAsRead,
  ]);

  return <View style={{ display: "none" }} />;
};
