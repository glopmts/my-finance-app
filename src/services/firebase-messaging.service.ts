import * as Notifications from "expo-notifications";
import { getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { Platform } from "react-native";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

class FirebaseMessagingService {
  private messaging: any = null;
  private isInitialized = false;

  // Inicializar Firebase
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Inicializar app Firebase
      if (getApps().length === 0) {
        initializeApp(firebaseConfig);
      }

      // Obter instância do messaging
      this.messaging = getMessaging();

      // Configurar listeners
      await this.setupMessageListeners();

      this.isInitialized = true;
      console.log("✅ Firebase Messaging inicializado");
      return true;
    } catch (error) {
      console.error("❌ Erro ao inicializar Firebase Messaging:", error);
      return false;
    }
  }

  // Obter token FCM
  async getFCMToken(): Promise<string | null> {
    try {
      if (!this.messaging) {
        await this.initialize();
      }

      // Verificar permissões
      const permission = await this.requestNotificationPermission();
      if (!permission) {
        console.log("❌ Permissão de notificações não concedida");
        return null;
      }

      // Obter token
      const token = await getToken(this.messaging, {
        vapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (token) {
        console.log("✅ Token FCM obtido:", token.substring(0, 20) + "...");
        return token;
      }

      return null;
    } catch (error) {
      console.error("❌ Erro ao obter token FCM:", error);
      return null;
    }
  }

  // Solicitar permissão de notificações
  async requestNotificationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === "ios") {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        return status === "granted";
      }

      // Android - Firebase lida automaticamente
      return true;
    } catch (error) {
      console.error("❌ Erro ao solicitar permissão:", error);
      return false;
    }
  }

  // Configurar listeners de mensagens
  private async setupMessageListeners(): Promise<void> {
    if (!this.messaging) return;

    try {
      // Ouvir mensagens em primeiro plano
      onMessage(this.messaging, (payload: any) => {
        console.log("📲 Mensagem FCM recebida em primeiro plano:", payload);

        // Mostrar notificação local
        this.showLocalNotification(payload);
      });

      console.log("👂 Listeners FCM configurados");
    } catch (error) {
      console.error("❌ Erro ao configurar listeners:", error);
    }
  }

  // Mostrar notificação local quando receber mensagem
  private async showLocalNotification(payload: any): Promise<void> {
    try {
      const { notification, data } = payload;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification?.title || "Nova mensagem",
          body: notification?.body || "",
          data: data || {},
          sound: true,
          badge: 1,
        },
        trigger: null,
      });
    } catch (error) {
      console.error("❌ Erro ao mostrar notificação local:", error);
    }
  }

  // Inscrever-se em um tópico
  async subscribeToTopic(topicName: string): Promise<boolean> {
    try {
      if (!this.messaging) {
        await this.initialize();
      }

      // Em produção, você faria isso no backend
      const token = await this.getFCMToken();
      if (!token) return false;

      // Chamar API do backend para inscrever no tópico
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/notifications/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            topic: topicName,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("❌ Erro ao se inscrever no tópico:", error);
      return false;
    }
  }

  // Cancelar inscrição de um tópico
  async unsubscribeFromTopic(topicName: string): Promise<boolean> {
    try {
      const token = await this.getFCMToken();
      if (!token) return false;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/notifications/unsubscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            topic: topicName,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("❌ Erro ao cancelar inscrição no tópico:", error);
      return false;
    }
  }

  // Enviar mensagem para tópico (do frontend - apenas para testes)
  async sendToTopic(topicName: string, message: any): Promise<boolean> {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/notifications/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: topicName,
            message,
          }),
        }
      );

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem para tópico:", error);
      return false;
    }
  }
}

export const firebaseMessagingService = new FirebaseMessagingService();
