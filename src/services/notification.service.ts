import {
  NotificationPayload,
  NotificationSettings,
  NotificationToken,
  StoredNotification,
} from "@/types/notification.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { API_BASE_URL } from "../lib/api-from-url";
import { logger } from "../utils/logger";

const STORAGE_KEYS = {
  NOTIFICATION_TOKEN: "@app:notification_token",
  NOTIFICATION_SETTINGS: "@app:notification_settings",
  NOTIFICATION_HISTORY: "@app:notification_history",
  PENDING_NOTIFICATIONS: "@app:pending_notifications",
  LAST_TOKEN_SYNC: "@app:last_token_sync",
  USER_ID: "@app:user_id",
} as const;

class NotificationService {
  private static instance: NotificationService;
  private syncInterval = 24 * 60 * 60 * 1000; // 24 horas
  private tokenSyncInterval: number | NodeJS.Timeout | null = null;

  private constructor() {
    this.configureNotifications();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Configurar comportamento das notificações
  private async configureNotifications(): Promise<void> {
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: false,
        }),
      });

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "default",
          enableVibrate: true,
          showBadge: true,
        });
      }
    } catch (error) {
      console.error("❌ Erro ao configurar notificações:", error);
    }
  }

  // Solicitar permissões
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.log("⚠️ Notificações não funcionam em emulador");
        return false;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        logger.error("❌ Permissão para notificações negada", "Notificação");
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Erro ao solicitar permissões:", error);
      return false;
    }
  }

  // Obter e salvar token de notificação
  async saveTokenToBackend(token: string, userId: string): Promise<boolean> {
    try {
      // 1. Salvar localmente
      const tokenData = {
        token,
        savedAt: new Date().toISOString(),
        deviceId: Device.modelName || "Unknown",
        platform: Platform.OS as "ios" | "android" | "web",
        deviceInfo: {
          brand: Device.brand,
          manufacturer: Device.manufacturer,
          modelName: Device.modelName,
          osName: Device.osName,
          osVersion: Device.osVersion,
          platform: Platform.OS,
          appVersion: Application.nativeApplicationVersion,
          buildVersion: Application.nativeBuildVersion,
        },
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_TOKEN,
        JSON.stringify(tokenData)
      );

      // 2. Salvar no backend
      const response = await fetch(`${API_BASE_URL}/notifications/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          token,
          platform: Platform.OS,
          deviceInfo: tokenData.deviceInfo,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.LAST_TOKEN_SYNC,
          new Date().toISOString()
        );
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
        return true;
      } else {
        console.error("❌ Erro ao salvar token no backend:", result.message);
        return false;
      }
    } catch (error) {
      console.error("❌ Erro ao salvar token no backend:", error);
      return false;
    }
  }

  async checkAndUpdateToken(userId: string): Promise<void> {
    try {
      const lastSyncStr = await AsyncStorage.getItem(
        STORAGE_KEYS.LAST_TOKEN_SYNC
      );
      const storedUserId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);

      // Se usuário mudou ou nunca sincronizou
      if (!lastSyncStr || storedUserId !== userId) {
        await this.syncTokenWithBackend(userId);
        return;
      }

      const lastSync = new Date(lastSyncStr);
      const now = new Date();
      const hoursSinceSync =
        (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

      // Sincronizar se passou mais de 24 horas
      if (hoursSinceSync >= 24) {
        await this.syncTokenWithBackend(userId);
      }
    } catch (error) {
      console.error("❌ Erro ao verificar token:", error);
    }
  }

  // Sincronizar token com backend
  private async syncTokenWithBackend(userId: string): Promise<boolean> {
    try {
      // Obter token atual do AsyncStorage
      const tokenJson = await AsyncStorage.getItem(
        STORAGE_KEYS.NOTIFICATION_TOKEN
      );
      if (!tokenJson) {
        return false;
      }

      const tokenData = JSON.parse(tokenJson);

      const savedAt = new Date(tokenData.savedAt);
      const now = new Date();
      const daysSinceSaved =
        (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceSaved > 30) {
        return false;
      }

      // Sincronizar com backend
      return await this.saveTokenToBackend(tokenData.token, userId);
    } catch (error) {
      console.error("❌ Erro ao sincronizar token:", error);
      return false;
    }
  }

  // Iniciar sincronização periódica
  startPeriodicSync(userId: string): void {
    if (this.tokenSyncInterval) {
      clearInterval(this.tokenSyncInterval as any);
    }

    this.tokenSyncInterval = setInterval(
      async () => {
        await this.checkAndUpdateToken(userId);
      },
      60 * 60 * 1000
    );
  }

  stopPeriodicSync(): void {
    if (this.tokenSyncInterval) {
      clearInterval(this.tokenSyncInterval as any);
      this.tokenSyncInterval = null;
    }
  }

  // Verificar status do token no backend
  async checkTokenStatus(userId: string): Promise<{
    hasToken: boolean;
    isEnabled: boolean;
    lastUpdated?: string;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/token/${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return {
          hasToken: !!result.data.notificationToken,
          isEnabled: result.data.isNotificationEnabled,
          lastUpdated: result.data.notificationTokenUpdatedAt,
        };
      }

      return { hasToken: false, isEnabled: false };
    } catch (error) {
      logger.error(`${error}`, "❌ Erro ao verificar status do token:");
      return { hasToken: false, isEnabled: false };
    }
  }
  // Obter token salvo
  async getStoredToken(): Promise<NotificationToken | null> {
    try {
      const tokenJson = await AsyncStorage.getItem(
        STORAGE_KEYS.NOTIFICATION_TOKEN
      );
      if (!tokenJson) return null;

      const tokenData: NotificationToken = JSON.parse(tokenJson);
      return tokenData;
    } catch (error) {
      console.error("❌ Erro ao obter token salvo:", error);
      return null;
    }
  }

  // Enviar notificação local
  async scheduleLocalNotification(
    payload: NotificationPayload,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          sound: payload.sound ?? true,
          badge: payload.badge,
          subtitle: payload.subtitle,
        },
        trigger: trigger || null,
      });

      // Salvar no histórico
      await this.saveToHistory({
        id: notificationId,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        read: false,
        timestamp: new Date(),
        category: payload.data?.category,
      });

      return notificationId;
    } catch (error) {
      console.error("❌ Erro ao agendar notificação:", error);
      throw error;
    }
  }

  // Salvar notificação no histórico
  private async saveToHistory(notification: StoredNotification): Promise<void> {
    try {
      const historyJson = await AsyncStorage.getItem(
        STORAGE_KEYS.NOTIFICATION_HISTORY
      );
      const history: StoredNotification[] = historyJson
        ? JSON.parse(historyJson)
        : [];

      // Limitar histórico a 100 notificações
      const updatedHistory = [notification, ...history].slice(0, 100);

      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_HISTORY,
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      console.error("❌ Erro ao salvar no histórico:", error);
    }
  }

  // Obter histórico de notificações
  async getNotificationHistory(): Promise<StoredNotification[]> {
    try {
      const historyJson = await AsyncStorage.getItem(
        STORAGE_KEYS.NOTIFICATION_HISTORY
      );
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error("❌ Erro ao obter histórico:", error);
      return [];
    }
  }

  // Marcar notificação como lida
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const history = await this.getNotificationHistory();
      const updatedHistory = history.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );

      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_HISTORY,
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      console.error("❌ Erro ao marcar como lida:", error);
    }
  }

  // Cancelar notificação agendada
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log("❌ Notificação cancelada:", notificationId);
    } catch (error) {
      console.error("❌ Erro ao cancelar notificação:", error);
    }
  }

  // Cancelar todas as notificações agendadas
  async cancelAllScheduledNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("🗑️ Todas notificações canceladas");
    } catch (error) {
      console.error("❌ Erro ao cancelar todas notificações:", error);
    }
  }

  // Limpar badges (iOS)
  async clearBadgeCount(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
      console.log("🔢 Badge limpo");
    } catch (error) {
      console.error("❌ Erro ao limpar badge:", error);
    }
  }

  // Obter configurações salvas
  async getSettings(): Promise<NotificationSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(
        STORAGE_KEYS.NOTIFICATION_SETTINGS
      );
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }

      const defaultSettings: NotificationSettings = {
        enabled: true,
        sound: true,
        vibration: true,
        badges: true,
        scheduleNotifications: true,
        reminderTime: "20:00",
      };

      return defaultSettings;
    } catch (error) {
      console.error("❌ Erro ao obter configurações:", error);
      return {
        enabled: true,
        sound: true,
        vibration: true,
        badges: true,
        scheduleNotifications: true,
        reminderTime: "20:00",
      };
    }
  }

  // Salvar configurações
  async saveSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };

      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_SETTINGS,
        JSON.stringify(updatedSettings)
      );

      console.log("⚙️ Configurações salvas:", updatedSettings);
    } catch (error) {
      console.error("❌ Erro ao salvar configurações:", error);
    }
  }

  // Enviar notificação push via API
  async sendPushNotification(
    token: string,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      const message = {
        to: token,
        sound: "default",
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        badge: payload.badge,
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
      console.log("📤 Notificação push enviada:", result);

      return result.data?.status === "ok";
    } catch (error) {
      console.error("❌ Erro ao enviar push:", error);
      return false;
    }
  }

  async clearToken(userId: string): Promise<void> {
    try {
      // Limpar localmente
      await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATION_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_TOKEN_SYNC);

      // Notificar backend
      await fetch(`${API_BASE_URL}/notifications/disable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      // Parar sincronização
      this.stopPeriodicSync();

      console.log("🗑️ Token limpo");
    } catch (error) {
      console.error("❌ Erro ao limpar token:", error);
    }
  }

  // Verificar status das permissões
  async getPermissionStatus(): Promise<Notifications.PermissionStatus> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error("❌ Erro ao verificar permissões:", error);

      return Notifications.PermissionStatus.UNDETERMINED as any;
    }
  }
}

export default NotificationService.getInstance();
