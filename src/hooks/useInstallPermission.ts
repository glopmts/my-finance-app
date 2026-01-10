import * as Application from "expo-application";
import * as IntentLauncher from "expo-intent-launcher";
import { useCallback, useState } from "react";
import { Alert, Linking, Platform } from "react-native";

export const useInstallPermission = () => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkInstallPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== "android") {
      return true;
    }

    try {
      setIsChecking(true);

      setHasPermission(false);
      return false;
    } catch (error) {
      console.error("Erro ao verificar permissão:", error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const requestInstallPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== "android") {
      return true;
    }

    try {
      // Criar um alerta mais explicativo que ajuda o usuário a entender o processo
      return new Promise((resolve) => {
        Alert.alert(
          "📱 Permissão de Instalação Necessária",
          `Para instalar atualizações do app, você precisará:\n\n` +
            `1. Permitir "Fontes Desconhecidas" ${
              Platform.Version >= "26"
                ? `para o app que fará a instalação (navegador ou gerenciador de arquivos)`
                : `nas configurações do dispositivo`
            }\n\n` +
            `2. Esta permissão é segura e só será usada para atualizações do ${Application.applicationName}\n\n` +
            `Quer abrir as configurações agora?`,
          [
            {
              text: "Agora não",
              style: "cancel",
              onPress: () => resolve(false),
            },
            {
              text: "Mostrar Instruções",
              onPress: () => {
                Alert.alert(
                  "📝 Instruções Detalhadas",
                  getInstallInstructions(),
                  [
                    { text: "Voltar", style: "cancel" },
                    {
                      text: "Abrir Configurações",
                      onPress: async () => {
                        const granted = await openInstallSettings();
                        resolve(granted);
                      },
                    },
                  ]
                );
              },
            },
            {
              text: "Abrir Configurações",
              onPress: async () => {
                const granted = await openInstallSettings();
                resolve(granted);
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
      return false;
    }
  }, []);

  const openInstallSettings = async (): Promise<boolean> => {
    try {
      if (Platform.Version >= "26") {
        // Android 8.0+ - tenta abrir as configurações específicas
        try {
          await IntentLauncher.startActivityAsync(
            "android.settings.MANAGE_UNKNOWN_APP_SOURCES",
            {
              data: `package:${Application.applicationId}`,
            }
          );
        } catch (error) {
          // Fallback para configurações gerais
          await Linking.openSettings();
        }
      } else {
        // Android 7.1 ou inferior
        await IntentLauncher.startActivityAsync(
          "android.settings.SECURITY_SETTINGS",
          {}
        );
      }

      return true;
    } catch (error) {
      console.error("Erro ao abrir configurações:", error);
      Alert.alert(
        "⚠️ Não foi possível abrir configurações",
        "Por favor, vá manualmente em:\n\n" +
          "Configurações → Apps → Menu (⋯) → Acesso especial → Instalar apps desconhecidos",
        [{ text: "OK" }]
      );
      return false;
    }
  };

  const getInstallInstructions = (): string => {
    if (Platform.Version >= "30") {
      return (
        `Para Android 11+:\n` +
        `1. Vá em Configurações → Apps\n` +
        `2. Toque no app que baixou o APK (ex: Chrome, Gerenciador de Arquivos)\n` +
        `3. Toque em "Instalar apps desconhecidos"\n` +
        `4. Ative a permissão\n\n` +
        `Nota: O Android pedirá confirmação na hora da instalação.`
      );
    } else if (Platform.Version >= "26") {
      return (
        `Para Android 8.0 a 10:\n` +
        `1. Vá em Configurações → Apps e notificações → Acesso especial\n` +
        `2. Toque em "Instalar apps desconhecidos"\n` +
        `3. Selecione o app que baixou o APK\n` +
        `4. Ative a permissão\n\n` +
        `Nota: O Android pedirá confirmação na hora da instalação.`
      );
    } else {
      return (
        `Para Android 7.1 ou inferior:\n` +
        `1. Vá em Configurações → Segurança\n` +
        `2. Ative "Fontes desconhecidas"\n` +
        `3. Confirme o alerta de segurança\n\n` +
        `Nota: Depois da instalação, desative esta opção para segurança.`
      );
    }
  };

  const ensureInstallPermission = useCallback(async (): Promise<boolean> => {
    return await requestInstallPermission();
  }, [requestInstallPermission]);

  return {
    hasPermission,
    isChecking,
    checkInstallPermission,
    requestInstallPermission,
    ensureInstallPermission,
  };
};
