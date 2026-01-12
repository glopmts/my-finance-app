import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { firebaseMessagingService } from "../services/firebase-messaging.service";
import notificationService from "../services/notification.service";
import { useClerkUser } from "./useClerkUser";

export const useFirebaseNotifications = () => {
  const { user } = useClerkUser();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  // Inicializar Firebase
  useEffect(() => {
    const initFirebase = async () => {
      const ready = await firebaseMessagingService.initialize();
      setIsFirebaseReady(ready);

      if (ready && user?.id) {
        const token = await firebaseMessagingService.getFCMToken();
        if (token) {
          setFcmToken(token);
          await notificationService.saveTokenToBackend(token, user.id);
        }
      }
    };

    initFirebase();
  }, [user?.id]);

  // Seu hook original com Firebase
  useEffect(() => {
    if (user?.id) {
      notificationService.startPeriodicSync(user.id);

      notificationService.checkAndUpdateToken(user.id).then(() => {
        console.log("✅ Notificações inicializadas para usuário:", user.id);
      });

      return () => {
        notificationService.stopPeriodicSync();
      };
    }
  }, [user?.id]);

  // Salvar token (agora com FCM)
  const savePushToken = useCallback(
    async (token: string) => {
      if (!user?.id) {
        console.warn("⚠️ Usuário não logado, não é possível salvar token");
        return false;
      }

      // Se já temos token FCM, usar ele
      if (fcmToken && isFirebaseReady) {
        return await notificationService.saveTokenToBackend(fcmToken, user.id);
      }

      // Senão, usar token do Expo
      return await notificationService.saveTokenToBackend(token, user.id);
    },
    [user?.id, fcmToken, isFirebaseReady]
  );

  // Inscrever em tópicos
  const subscribeToTopic = useCallback(
    async (topicName: string) => {
      if (!isFirebaseReady) {
        console.warn("⚠️ Firebase não inicializado");
        return false;
      }

      return await firebaseMessagingService.subscribeToTopic(topicName);
    },
    [isFirebaseReady]
  );

  // Cancelar inscrição de tópicos
  const unsubscribeFromTopic = useCallback(
    async (topicName: string) => {
      if (!isFirebaseReady) return false;
      return await firebaseMessagingService.unsubscribeFromTopic(topicName);
    },
    [isFirebaseReady]
  );

  // Enviar mensagem para tópico
  const sendToTopic = useCallback(
    async (topicName: string, message: any) => {
      if (!isFirebaseReady) return false;
      return await firebaseMessagingService.sendToTopic(topicName, message);
    },
    [isFirebaseReady]
  );

  // Verificar status
  const checkStatus = useCallback(async () => {
    if (!user?.id) return null;

    const status = await notificationService.checkTokenStatus(user.id);

    // Adicionar info do Firebase
    return {
      ...status,
      hasFCM: !!fcmToken,
      isFirebaseReady,
      platform: Platform.OS,
    };
  }, [user?.id, fcmToken, isFirebaseReady]);

  // Limpar token
  const clearToken = useCallback(async () => {
    if (!user?.id) return;
    await notificationService.clearToken(user.id);
    setFcmToken(null);
  }, [user?.id]);

  return {
    // Tokens
    token: fcmToken,
    fcmToken,
    isFirebaseReady,

    // Métodos do Firebase
    subscribeToTopic,
    unsubscribeFromTopic,
    sendToTopic,

    // Métodos originais
    savePushToken,
    checkStatus,
    clearToken,
  };
};
