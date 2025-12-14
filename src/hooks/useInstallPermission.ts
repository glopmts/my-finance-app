import * as Application from "expo-application";
import * as IntentLauncher from "expo-intent-launcher";
import { useCallback, useState } from "react";
import { Alert, Platform } from "react-native";

export const useInstallPermission = () => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkInstallPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== "android") {
      return true; // iOS não precisa desta permissão
    }

    try {
      setIsChecking(true);

      // Para Android 8.0 (API 26) ou superior
      if (Platform.Version >= 26) {
        try {
          await IntentLauncher.startActivityAsync(
            "android.settings.MANAGE_UNKNOWN_APP_SOURCES",
            {
              data: `package:${Application.applicationId}`,
              extra: { from_settings: true },
            }
          );

          setHasPermission(true);
          return true;
        } catch (error) {
          console.log("Não foi possível verificar permissão:", error);
          return false;
        }
      }

      // Para Android inferior a 8.0, a permissão é diferente
      setHasPermission(true);
      return true;
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

    return new Promise((resolve) => {
      Alert.alert(
        "Permissão Necessária",
        "Para instalar atualizações, você precisa permitir a instalação de apps de fontes desconhecidas.\n\n" +
          "Isso é necessário apenas para atualizações do nosso aplicativo.",
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Abrir Configurações",
            onPress: async () => {
              try {
                if (Platform.Version >= "26") {
                  // Android 8.0+
                  await IntentLauncher.startActivityAsync(
                    "android.settings.MANAGE_UNKNOWN_APP_SOURCES",
                    {
                      data: `package:${Application.applicationId}`,
                      flags: 1,
                    }
                  );
                } else {
                  // Android 7.1 ou inferior
                  await IntentLauncher.startActivityAsync(
                    "android.settings.SECURITY_SETTINGS",
                    {}
                  );
                }

                // Dar tempo para o usuário alterar a configuração
                setTimeout(async () => {
                  const hasPerm = await checkInstallPermission();
                  setHasPermission(hasPerm);
                  resolve(hasPerm);
                }, 1000);
              } catch (error) {
                console.error("Erro ao abrir configurações:", error);
                Alert.alert(
                  "Erro",
                  'Não foi possível abrir as configurações. Por favor, ative manualmente a opção "Fontes desconhecidas" nas configurações de segurança.',
                  [{ text: "OK", onPress: () => resolve(false) }]
                );
              }
            },
          },
        ]
      );
    });
  }, [checkInstallPermission]);

  const ensureInstallPermission = useCallback(async (): Promise<boolean> => {
    const hasPerm = await checkInstallPermission();

    if (hasPerm) {
      setHasPermission(true);
      return true;
    }

    return await requestInstallPermission();
  }, [checkInstallPermission, requestInstallPermission]);

  return {
    hasPermission,
    isChecking,
    checkInstallPermission,
    requestInstallPermission,
    ensureInstallPermission,
  };
};
