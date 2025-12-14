import * as DocumentPicker from "expo-document-picker";
import * as IntentLauncher from "expo-intent-launcher";
import * as Notifications from "expo-notifications";
import * as Updates from "expo-updates";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState, Linking, Platform } from "react-native";
import { showPlatformMessage } from "../components/alerts/toast-message";
import { useLog } from "../contexts/LogContext";
import type {
  GitHubReleaseInfo,
  UpdateInfo,
  UpdateProgress,
} from "../types/update.types";
import { useInstallPermission } from "./useInstallPermission";

const GITHUB_REPO = "glopmts/my-finance-app";
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export const useOTAUpdate = () => {
  const { info, warn, error: errorLog, debug } = useLog();

  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    isAvailable: false,
    source: undefined,
  });

  const [updateProgress, setUpdateProgress] = useState<UpdateProgress>({
    isDownloading: false,
    isInstalling: false,
    progress: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [githubRelease, setGithubRelease] = useState<GitHubReleaseInfo | null>(
    null
  );

  const {
    hasPermission,
    isChecking: isCheckingPermission,
    ensureInstallPermission,
  } = useInstallPermission();

  // Use ref para controlar chamadas únicas
  const hasCheckedRef = useRef(false);
  const notificationCooldownRef = useRef(false);

  // Obter versão atual
  const getCurrentVersion = useCallback(() => {
    try {
      const manifest = Updates.manifest as Record<string, unknown> | null;
      return {
        version: (manifest?.version as string) || "1.0.0",
        buildNumber: (manifest?.revisionId as string) || "1",
      };
    } catch (error) {
      showPlatformMessage("Erro ao obter versão:" + error);
      errorLog("Erro ao obter versão", "OTAUpdate", {
        error: error instanceof Error ? error.message : String(error),
        url: GITHUB_API_URL,
      });
      return { version: "1.0.0", buildNumber: "1" };
    }
  }, [errorLog]);

  // Comparador de versões
  const compareVersions = useCallback((v1: string, v2: string): number => {
    try {
      const cleanVersion = (v: string) =>
        v.replace(/^v/, "").replace(/[^0-9.]/g, "");
      const parts1 = cleanVersion(v1).split(".").map(Number);
      const parts2 = cleanVersion(v2).split(".").map(Number);

      for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
      }
      return 0;
    } catch (err) {
      console.error("Erro ao comparar versões:", err);
      return 0;
    }
  }, []);

  // Buscar URL do APK no GitHub
  const getApkDownloadUrl = useCallback((githubData: any): string => {
    try {
      const assets = githubData.assets || [];
      const apkAsset = assets.find(
        (asset: any) =>
          asset.name.toLowerCase().endsWith(".apk") ||
          asset.name.toLowerCase().includes("android")
      );
      return apkAsset?.browser_download_url || "";
    } catch (err) {
      console.error("Erro ao obter URL do APK:", err);
      return "";
    }
  }, []);

  // Verificar se é obrigatório
  const checkIfMandatory = useCallback((githubData: any): boolean => {
    try {
      const body = githubData.body || "";
      return (
        body.toLowerCase().includes("[obrigatória]") ||
        body.toLowerCase().includes("[critical]") ||
        body.toLowerCase().includes("[mandatory]")
      );
    } catch (err) {
      console.error("Erro ao verificar obrigatoriedade:", err);
      return false;
    }
  }, []);

  // Função para enviar notificação com cooldown
  const sendNotificationWithCooldown = async (
    title: string,
    body: string,
    data?: any
  ) => {
    if (notificationCooldownRef.current) {
      return;
    }

    try {
      notificationCooldownRef.current = true;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: body.substring(0, 100) + "...",
          data: { ...data, timestamp: Date.now() },
        },
        trigger: null,
      });

      setTimeout(() => {
        notificationCooldownRef.current = false;
      }, 5000);
    } catch (err) {
      notificationCooldownRef.current = false;
    }
  };

  // Verificar atualização no GitHub
  const checkGitHubUpdate =
    useCallback(async (): Promise<GitHubReleaseInfo | null> => {
      try {
        const response = await fetch(GITHUB_API_URL, {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "MyFinanceApp",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`GitHub API error: ${response.status}`);
        }
        const data = await response.json();
        if (!data.tag_name) {
          info("📭 Nenhuma release encontrada", "release");
          return null;
        }

        const currentVersion = getCurrentVersion();
        const latestVersion = data.tag_name;
        const hasNewUpdate =
          compareVersions(latestVersion, currentVersion.version) > 0;

        if (!hasNewUpdate) {
          return null;
        }

        const downloadUrl = getApkDownloadUrl(data);

        if (!downloadUrl) {
          return null;
        }

        const githubInfo: GitHubReleaseInfo = {
          version: latestVersion,
          releaseNotes: data.body || "Nova atualização disponível",
          downloadUrl,
          isMandatory: checkIfMandatory(data),
          publishedAt: data.published_at,
          assets: data.assets || [],
        };

        setGithubRelease(githubInfo);
        setUpdateInfo((prev) => ({
          ...prev,
          isAvailable: true,
          source: "github",
          githubInfo,
        }));

        return githubInfo;
      } catch (err) {
        console.error("❌ Erro ao verificar GitHub:", err);
        errorLog("❌ Erro ao verificar GitHub:", "GitHub Error", {
          err,
        });
        return null;
      }
    }, [
      getCurrentVersion,
      compareVersions,
      getApkDownloadUrl,
      checkIfMandatory,
      errorLog,
      info,
    ]);

  // Verificar atualizações (Expo OTA + GitHub)
  const checkForUpdates = useCallback(
    async (showNotification = true): Promise<boolean> => {
      try {
        if (hasCheckedRef.current) {
          return updateInfo.isAvailable;
        }
        setError(null);

        let hasExpoUpdate = false;

        // Verificar Expo OTA
        if (!__DEV__ && Updates.isEnabled) {
          try {
            const expoUpdate = await Updates.checkForUpdateAsync();

            if (expoUpdate.isAvailable) {
              info("📦 Atualização Expo OTA disponível", "Update_OTA");

              setUpdateInfo({
                isAvailable: true,
                manifest: expoUpdate.manifest,
                source: "expo",
              });

              hasExpoUpdate = true;

              if (showNotification) {
                await sendNotificationWithCooldown(
                  "Atualização Disponível",
                  "Uma nova atualização OTA está disponível!"
                );
              }
            }
          } catch (expoError) {
            showPlatformMessage("Erro ao verificar Expo OTA:");
            errorLog("Erro ao verificar Expo OTA:", "erro_ota", {
              expoError,
            });
          }
        }

        if (!hasExpoUpdate) {
          const githubUpdate = await checkGitHubUpdate();

          if (githubUpdate && showNotification) {
            await sendNotificationWithCooldown(
              `🎉 Nova Versão ${githubUpdate.version}`,
              githubUpdate.releaseNotes,
              { type: "github_update" }
            );
          }

          if (githubUpdate) {
            hasCheckedRef.current = true;
            return true;
          }
        }

        hasCheckedRef.current = true;
        return hasExpoUpdate;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao verificar atualizações";
        console.error("Erro ao verificar atualizações:", err);
        setError(errorMessage);
        hasCheckedRef.current = true;
        return false;
      }
    },
    [checkGitHubUpdate, updateInfo.isAvailable, errorLog, info]
  );

  // Função para abrir seletor de arquivo APK
  const openAPKFilePicker = useCallback(async () => {
    try {
      if (Platform.OS !== "android") {
        Alert.alert(
          "Aviso",
          "Atualizações via APK só estão disponíveis para Android"
        );
        return null;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.android.package-archive",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log("Seleção de arquivo cancelada");
        return null;
      }

      const file = result.assets[0];

      if (!file.name?.endsWith(".apk")) {
        Alert.alert("Arquivo inválido", "Por favor, selecione um arquivo APK");
        return null;
      }

      return file.uri;
    } catch (err) {
      errorLog("❌ Erro ao selecionar arquivo:", "File error", {
        err,
      });
      Alert.alert("Erro", "Não foi possível selecionar o arquivo APK");
      return null;
    }
  }, [errorLog]);

  // Função para instalar no Android 11+
  const installAPKAndroid11Plus = useCallback(async (apkUri: string) => {
    try {
      // Para Android 11+, usamos ACTION_VIEW com Content URI
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: apkUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: "application/vnd.android.package-archive",
      });

      Alert.alert(
        "Instalação Iniciada",
        "O instalador do Android foi aberto. Complete a instalação e reinicie o app.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Erro ao instalar no Android 11+:", error);
      throw error;
    }
  }, []);

  // Função para instalar no Android 10 ou inferior
  const installAPKLegacy = useCallback(async (apkUri: string) => {
    try {
      // Usar Linking para abrir o APK
      const canOpen = await Linking.canOpenURL(apkUri);

      if (canOpen) {
        await Linking.openURL(apkUri);
      } else {
        // Fallback: tentar com file:// URI
        const fileUri = apkUri.startsWith("file://")
          ? apkUri
          : `file://${apkUri}`;
        await Linking.openURL(fileUri);
      }

      Alert.alert(
        "Instalação Iniciada",
        "O instalador do Android foi aberto. Complete a instalação e reinicie o app.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Erro ao instalar no Android legacy:", error);
      throw error;
    }
  }, []);

  // Instalar APK selecionado
  const installAPK = useCallback(
    async (apkUri: string) => {
      try {
        // Verificar permissão antes de instalar
        if (Platform.OS === "android") {
          const hasInstallPermission = await ensureInstallPermission();

          if (!hasInstallPermission) {
            Alert.alert(
              "Permissão Negada",
              "Não é possível instalar a atualização sem a permissão para instalar de fontes desconhecidas.",
              [{ text: "OK" }]
            );
            return;
          }
        }

        setUpdateProgress((prev) => ({
          ...prev,
          isInstalling: true,
          progress: 100,
        }));

        // Para Android 11+ (API 30), precisamos de uma abordagem diferente
        if (Platform.OS === "android" && Platform.Version >= 30) {
          // Android 11+ usa Content URI
          await installAPKAndroid11Plus(apkUri);
        } else {
          // Android 10 ou inferior
          await installAPKLegacy(apkUri);
        }

        setUpdateProgress((prev) => ({
          ...prev,
          isInstalling: false,
          progress: 0,
        }));
      } catch (err) {
        console.error("❌ Erro ao instalar APK:", err);

        setUpdateProgress((prev) => ({
          ...prev,
          isInstalling: false,
          progress: 0,
        }));

        Alert.alert(
          "Erro na Instalação",
          "Não foi possível abrir o instalador. " +
            "Certifique-se de que:\n\n" +
            "1. A instalação de apps de fontes desconhecidas está permitida\n" +
            "2. O arquivo é um APK válido\n" +
            "3. Você tem permissão para instalar apps",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Abrir Configurações",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    },
    [ensureInstallPermission, installAPKAndroid11Plus, installAPKLegacy]
  );

  // Função auxiliar para continuar o fluxo
  const continueWithUpdateFlow = useCallback(async () => {
    Alert.alert(
      `Atualização ${updateInfo.githubInfo!.version}`,
      `${updateInfo.githubInfo!.releaseNotes}\n\n` +
        "Para instalar:\n" +
        "1. Baixe o APK usando o botão abaixo\n" +
        "2. Volte para este app\n" +
        "3. Selecione o APK baixado",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Baixar APK",
          onPress: () => {
            // Abrir URL do APK no navegador/navegador de downloads
            Linking.openURL(updateInfo.githubInfo!.downloadUrl);

            // Mostrar instruções após alguns segundos
            setTimeout(async () => {
              Alert.alert(
                "APK Baixado",
                "Por favor, selecione o arquivo APK baixado para instalação.",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Selecionar APK",
                    onPress: async () => {
                      const apkUri = await openAPKFilePicker();
                      if (apkUri) {
                        await installAPK(apkUri);
                      }
                    },
                  },
                  {
                    text: "Ajuda",
                    onPress: () => {
                      Alert.alert(
                        "Ajuda com Instalação",
                        "Se não conseguir instalar:\n\n" +
                          "1. Verifique se permitiu 'Fontes desconhecidas' nas configurações\n" +
                          "2. Tente localizar o APK no gerenciador de arquivos\n" +
                          "3. Execute o APK manualmente",
                        [{ text: "OK" }]
                      );
                    },
                  },
                ]
              );
            }, 5000);
          },
        },
      ]
    );
  }, [installAPK, openAPKFilePicker, updateInfo.githubInfo]);

  const downloadAndInstallUpdate = useCallback(async () => {
    try {
      if (updateInfo.source === "expo") {
        // Atualização OTA do Expo
        setUpdateProgress({
          isDownloading: true,
          isInstalling: false,
          progress: 0,
        });

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Download Iniciado",
            body: "Baixando atualização OTA...",
          },
          trigger: null,
        });

        const result = await Updates.fetchUpdateAsync();

        if (result.isNew) {
          setUpdateProgress({
            isDownloading: false,
            isInstalling: true,
            progress: 100,
          });

          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Atualização Pronta",
              body: "Reiniciando o app...",
            },
            trigger: null,
          });

          await new Promise((resolve) => setTimeout(resolve, 1000));
          await Updates.reloadAsync();
        }
      } else if (updateInfo.source === "github" && updateInfo.githubInfo) {
        // Verificar permissão antes de prosseguir
        if (Platform.OS === "android") {
          const hasInstallPermission = await ensureInstallPermission();

          if (!hasInstallPermission) {
            // Se o usuário negou a permissão, mostrar alerta explicativo
            Alert.alert(
              "Permissão Necessária",
              "Para instalar atualizações, é necessário permitir a instalação de apps de fontes desconhecidas.\n\n" +
                "Sem esta permissão, você pode baixar o APK mas não poderá instalá-lo.",
              [
                {
                  text: "Continuar sem Instalar",
                  style: "cancel",
                  onPress: () => {
                    // Apenas abrir o link para download
                    Linking.openURL(updateInfo.githubInfo!.downloadUrl);
                  },
                },
                {
                  text: "Configurar Permissão",
                  onPress: async () => {
                    // Tentar novamente obter permissão
                    const permissionGranted = await ensureInstallPermission();
                    if (permissionGranted) {
                      // Se concedeu, continuar com o fluxo normal
                      continueWithUpdateFlow();
                    }
                  },
                },
              ]
            );
            return;
          }
        }

        // Se tem permissão ou não é Android, continuar com fluxo normal
        continueWithUpdateFlow();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro no processo de atualização";
      setError(errorMessage);
      console.error("Erro no processo de atualização:", err);

      Alert.alert("Erro", "Ocorreu um erro durante a atualização");

      setUpdateProgress({
        isDownloading: false,
        isInstalling: false,
        progress: 0,
      });
    }
  }, [
    updateInfo.source,
    updateInfo.githubInfo,
    continueWithUpdateFlow,
    ensureInstallPermission,
  ]);

  // Resetar verificação quando o app voltar do background
  useEffect(() => {
    const handleAppStateChange = () => {
      setTimeout(
        () => {
          hasCheckedRef.current = false;
        },
        30 * 60 * 1000
      );
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdates(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [checkForUpdates]);

  const forceCheckUpdates = useCallback(async () => {
    hasCheckedRef.current = false;
    return await checkForUpdates(true);
  }, [checkForUpdates]);

  return {
    updateInfo,
    updateProgress,
    error,
    hasPermission,
    githubRelease,
    isCheckingPermission,
    checkForUpdates: forceCheckUpdates,
    downloadAndInstallUpdate,
    openAPKFilePicker,
    installAPK,
    hasChecked: hasCheckedRef.current,
  };
};
