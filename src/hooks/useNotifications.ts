import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import notificationService from "../services/notification.service";
import {
  NotificationResponse,
  NotificationSettings,
  StoredNotification,
} from "../types/notification.types";
import { logger } from "../utils/logger";
import { useClerkUser } from "./useClerkUser";

const STORAGE_KEYS = {
  NOTIFICATION_SETTINGS: "@app:notification_settings",
  NOTIFICATION_HISTORY: "@app:notification_history",
  NOTIFICATION_TOKEN: "@app:notification_token",
} as const;

export const useNotifications = () => {
  const { user } = useClerkUser();

  const [token, setToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [history, setHistory] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastNotification, setLastNotification] =
    useState<NotificationResponse | null>(null);

  useEffect(() => {
    const initialize = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        // 1. Inicializar serviço
        notificationService.startPeriodicSync(user.id);
        await notificationService.checkAndUpdateToken(user.id);

        // 2. Verificar permissões
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionGranted(status === "granted");

        // 3. Carregar configurações locais
        await loadLocalSettings();
        await loadLocalHistory();

        // 4. Carregar token local
        const localToken = await AsyncStorage.getItem(
          STORAGE_KEYS.NOTIFICATION_TOKEN
        );
        if (localToken) {
          const tokenData = JSON.parse(localToken);
          setToken(tokenData.token);
        }
      } catch (error) {
        logger.error("❌ Erro ao inicializar notificações:", "notification");
      } finally {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      notificationService.stopPeriodicSync();
    };
  }, [user?.id]);

  // Carregar configurações locais
  const loadLocalSettings = async () => {
    try {
      const settingsJson = await AsyncStorage.getItem(
        STORAGE_KEYS.NOTIFICATION_SETTINGS
      );
      if (settingsJson) {
        setSettings(JSON.parse(settingsJson));
      } else {
        const defaultSettings: NotificationSettings = {
          enabled: true,
          sound: true,
          vibration: true,
          badges: true,
          scheduleNotifications: true,
          reminderTime: "20:00",
        };
        setSettings(defaultSettings);
        await AsyncStorage.setItem(
          STORAGE_KEYS.NOTIFICATION_SETTINGS,
          JSON.stringify(defaultSettings)
        );
      }
    } catch (error) {
      console.error("❌ Erro ao carregar configurações:", error);
    }
  };

  // Carregar histórico local
  const loadLocalHistory = async () => {
    try {
      const historyJson = await AsyncStorage.getItem(
        STORAGE_KEYS.NOTIFICATION_HISTORY
      );
      if (historyJson) {
        setHistory(JSON.parse(historyJson));
      }
    } catch (error) {
      console.error("❌ Erro ao carregar histórico:", error);
    }
  };

  // Seus métodos originais
  const savePushToken = useCallback(
    async (pushToken: string) => {
      if (!user?.id) {
        console.warn("⚠️ Usuário não logado, não é possível salvar token");
        return false;
      }

      const saved = await notificationService.saveTokenToBackend(
        pushToken,
        user.id
      );
      if (saved) {
        setToken(pushToken);
        // Salvar localmente também
        await AsyncStorage.setItem(
          STORAGE_KEYS.NOTIFICATION_TOKEN,
          JSON.stringify({
            token: pushToken,
            savedAt: new Date().toISOString(),
            platform: Platform.OS,
          })
        );
      }
      return saved;
    },
    [user?.id]
  );

  const checkStatus = useCallback(async () => {
    if (!user?.id) return null;
    return await notificationService.checkTokenStatus(user.id);
  }, [user?.id]);

  const clearToken = useCallback(async () => {
    if (!user?.id) return;
    await notificationService.clearToken(user.id);
    setToken(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATION_TOKEN);
  }, [user?.id]);

  // Métodos adicionais necessários para o ContextType
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === "granted";
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error("❌ Erro ao solicitar permissões:", error);
      return false;
    }
  }, []);

  const sendNotification = useCallback(
    async (
      title: string,
      body: string,
      data?: Record<string, any>,
      trigger?: Notifications.NotificationTriggerInput
    ): Promise<string> => {
      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: data || {},
            sound: true,
          },
          trigger: trigger || null,
        });

        // Adicionar ao histórico
        const newNotification: StoredNotification = {
          id: notificationId,
          title,
          body,
          data,
          read: false,
          timestamp: new Date(),
          category: data?.category,
        };

        const updatedHistory = [newNotification, ...history];
        setHistory(updatedHistory);
        await AsyncStorage.setItem(
          STORAGE_KEYS.NOTIFICATION_HISTORY,
          JSON.stringify(updatedHistory)
        );

        return notificationId;
      } catch (error) {
        console.error("❌ Erro ao enviar notificação:", error);
        throw error;
      }
    },
    [history]
  );

  const sendPushNotification = useCallback(
    async (
      toToken: string,
      title: string,
      body: string,
      data?: Record<string, any>
    ): Promise<boolean> => {
      try {
        const message = {
          to: toToken,
          sound: "default",
          title,
          body,
          data: data || {},
        };

        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        });

        const result = await response.json();
        return result.data?.status === "ok";
      } catch (error) {
        console.error("❌ Erro ao enviar push:", error);
        return false;
      }
    },
    []
  );

  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>): Promise<boolean> => {
      try {
        const current = settings || {
          enabled: true,
          sound: true,
          vibration: true,
          badges: true,
          scheduleNotifications: true,
          reminderTime: "20:00",
        };

        const updated = { ...current, ...newSettings };
        setSettings(updated);

        await AsyncStorage.setItem(
          STORAGE_KEYS.NOTIFICATION_SETTINGS,
          JSON.stringify(updated)
        );

        return true;
      } catch (error) {
        console.error("❌ Erro ao atualizar configurações:", error);
        return false;
      }
    },
    [settings]
  );

  const markAsRead = useCallback(
    async (notificationId: string): Promise<void> => {
      try {
        const updatedHistory = history.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        );

        setHistory(updatedHistory);
        await AsyncStorage.setItem(
          STORAGE_KEYS.NOTIFICATION_HISTORY,
          JSON.stringify(updatedHistory)
        );
      } catch (error) {
        console.error("❌ Erro ao marcar como lida:", error);
      }
    },
    [history]
  );

  const cancelNotification = useCallback(
    async (notificationId: string): Promise<void> => {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);

        const updatedHistory = history.filter((n) => n.id !== notificationId);
        setHistory(updatedHistory);
        await AsyncStorage.setItem(
          STORAGE_KEYS.NOTIFICATION_HISTORY,
          JSON.stringify(updatedHistory)
        );
      } catch (error) {
        console.error("❌ Erro ao cancelar notificação:", error);
      }
    },
    [history]
  );

  const clearBadge = useCallback(async (): Promise<void> => {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error("❌ Erro ao limpar badge:", error);
    }
  }, []);

  const initialize = useCallback(async (): Promise<void> => {
    // Já é feito no useEffect
  }, []);

  // Listener para notificações recebidas
  useEffect(() => {
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        setLastNotification(response as unknown as NotificationResponse);
      });

    return () => {
      responseSubscription.remove();
    };
  }, []);

  return {
    // Estado
    token,
    permissionGranted,
    settings,
    history,
    loading,
    lastNotification,
    hasToken: !!token,
    unreadCount: history.filter((n) => !n.read).length,

    // Métodos
    initialize,
    requestPermissions,
    sendNotification,
    sendPushNotification,
    updateSettings,
    markAsRead,
    cancelNotification,
    clearBadge,

    savePushToken,
    checkStatus,
    clearToken,
  };
};
