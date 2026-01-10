export type NotificationPayload = {
  title: string;
  body: string;
  data?: Record<string, any>;
  subtitle?: string;
  sound?: boolean;
  badge?: number;
};

// Tipo para a resposta da notificação (quando usuário toca)
export type NotificationResponse = {
  notification: {
    request: {
      identifier: string;
      content: {
        title: string | null;
        body: string | null;
        data?: Record<string, any>;
        badge?: number;
        sound?: string | boolean;
        subtitle?: string;
      };
    };
  };
  actionIdentifier: string;
  userText?: string;
};

// Tipo simplificado para uso no contexto
export type SimpleNotificationResponse = {
  title: string;
  body: string;
  data?: Record<string, any>;
  action: string;
  notificationId?: string;
};

export type NotificationToken = {
  token: string;
  savedAt: Date;
  deviceId?: string;
  platform: "ios" | "android" | "web";
};

export type NotificationSettings = {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badges: boolean;
  scheduleNotifications: boolean;
  reminderTime?: string;
};

export type StoredNotification = {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  timestamp: Date;
  category?: string;
};
