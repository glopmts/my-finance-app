import * as Notifications from "expo-notifications";
import * as Updates from "expo-updates";
import { useCallback, useEffect, useState } from "react";

export interface UpdateInfo {
  isAvailable: boolean;
  manifest?: Updates.Manifest;
}

export interface UpdateProgress {
  isDownloading: boolean;
  isInstalling: boolean;
  progress: number;
}

export const useOTAUpdate = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    isAvailable: false,
  });
  const [updateProgress, setUpdateProgress] = useState<UpdateProgress>({
    isDownloading: false,
    isInstalling: false,
    progress: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Configurar notificações
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  // Verificar se há atualizações disponíveis
  const checkForUpdates = useCallback(async () => {
    try {
      if (!__DEV__) {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          setUpdateInfo({
            isAvailable: true,
            manifest: update.manifest,
          });
          return true;
        }
      }
      return false;
    } catch (err) {
      setError("Erro ao verificar atualizações");
      console.error("Erro ao verificar atualizações:", err);
      return false;
    }
  }, []);

  // Baixar atualização
  const downloadUpdate = useCallback(async () => {
    try {
      setUpdateProgress({
        isDownloading: true,
        isInstalling: false,
        progress: 0,
      });

      // Mostrar notificação de download iniciado
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Download Iniciado",
          body: "Baixando atualização do aplicativo...",
        },
        trigger: null,
      });

      const progressInterval = setInterval(() => {
        setUpdateProgress((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 500);

      const result = await Updates.fetchUpdateAsync();

      clearInterval(progressInterval);

      setUpdateProgress({
        isDownloading: false,
        isInstalling: false,
        progress: 100,
      });

      // Notificação de download concluído
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Download Concluído",
          body: "Atualização pronta para instalação!",
        },
        trigger: null,
      });

      return result.isNew;
    } catch (err) {
      setError("Erro ao baixar atualização");
      console.error("Erro ao baixar atualização:", err);

      setUpdateProgress({
        isDownloading: false,
        isInstalling: false,
        progress: 0,
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Erro no Download",
          body: "Não foi possível baixar a atualização.",
        },
        trigger: null,
      });

      return false;
    }
  }, []);

  // Instalar e reiniciar
  const installUpdate = useCallback(async () => {
    try {
      setUpdateProgress({
        isDownloading: false,
        isInstalling: true,
        progress: 100,
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Instalando",
          body: "Instalando atualização...",
        },
        trigger: null,
      });

      // Aguardar um momento para o usuário ver a mensagem
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await Updates.reloadAsync();
    } catch (err) {
      setError("Erro ao instalar atualização");
      console.error("Erro ao instalar atualização:", err);

      setUpdateProgress({
        isDownloading: false,
        isInstalling: false,
        progress: 0,
      });
    }
  }, []);

  return {
    updateInfo,
    updateProgress,
    error,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
  };
};
