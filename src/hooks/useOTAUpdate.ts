import * as DocumentPicker from "expo-document-picker";
import * as Notifications from "expo-notifications";
import * as Updates from "expo-updates";
import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import { showPlatformMessage } from "../components/alerts/toast-message";
import type {
  GitHubReleaseInfo,
  UpdateInfo,
  UpdateProgress,
} from "../types/update.types";

const GITHUB_REPO = "glopmts/my-finance-app";
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export const useOTAUpdate = () => {
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

  // Configurar notificações
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          console.log("Permissão para notificações não concedida");
        }
      } catch (err) {
        console.error("Erro ao configurar notificações:", err);
      }
    };

    setupNotifications();
  }, []);

  // Obter versão atual
  const getCurrentVersion = useCallback(() => {
    try {
      const manifest = Updates.manifest as Record<string, unknown> | null;
      return {
        version: (manifest?.version as string) || "1.0.0",
        buildNumber: (manifest?.revisionId as string) || "1",
      };
    } catch (error) {
      console.error("Erro ao obter versão:", error);
      return { version: "1.0.0", buildNumber: "1" };
    }
  }, []);

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
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        const currentVersion = getCurrentVersion();

        const latestVersion = data.tag_name;
        const hasNewUpdate =
          compareVersions(latestVersion, currentVersion.version) > 0;

        if (hasNewUpdate) {
          const downloadUrl = getApkDownloadUrl(data);

          if (!downloadUrl) {
            showPlatformMessage("⚠️ Nenhum APK encontrado na release");
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

          // Mostrar notificação
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `🎉 Nova Versão ${githubInfo.version}`,
              body: githubInfo.releaseNotes.substring(0, 100) + "...",
              data: { type: "github_update" },
            },
            trigger: null,
          });

          return githubInfo;
        }

        return null;
      } catch (err) {
        console.error("❌ Erro ao verificar GitHub:", err);
        setError("Não foi possível verificar atualizações do GitHub");
        return null;
      }
    }, [
      getCurrentVersion,
      compareVersions,
      getApkDownloadUrl,
      checkIfMandatory,
    ]);

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

      // Verificar se é um APK
      if (!file.name?.endsWith(".apk")) {
        Alert.alert("Arquivo inválido", "Por favor, selecione um arquivo APK");
        return null;
      }

      return file.uri;
    } catch (err) {
      console.error("❌ Erro ao selecionar arquivo:", err);
      Alert.alert("Erro", "Não foi possível selecionar o arquivo APK");
      return null;
    }
  }, []);

  // Instalar APK selecionado
  const installAPK = useCallback(async (apkUri: string) => {
    try {
      setUpdateProgress((prev) => ({
        ...prev,
        isInstalling: true,
        progress: 100,
      }));

      // Usar Linking para abrir o APK
      const canOpen = await Linking.canOpenURL(apkUri);

      if (canOpen) {
        await Linking.openURL(apkUri);

        Alert.alert(
          "Instalação Iniciada",
          "O instalador do Android foi aberto. Complete a instalação e reinicie o app.",
          [{ text: "OK" }]
        );
      } else {
        // Fallback: tentar com file:// URI
        const fileUri = apkUri.startsWith("file://")
          ? apkUri
          : `file://${apkUri}`;
        await Linking.openURL(fileUri);
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
  }, []);

  // Verificar atualizações (Expo OTA + GitHub)
  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      let hasExpoUpdate = false;
      if (!__DEV__ && Updates.isEnabled) {
        try {
          const expoUpdate = await Updates.checkForUpdateAsync();

          if (expoUpdate.isAvailable) {
            setUpdateInfo({
              isAvailable: true,
              manifest: expoUpdate.manifest,
              source: "expo",
            });
            hasExpoUpdate = true;

            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Atualização Disponível",
                body: "Uma nova atualização OTA está disponível!",
              },
              trigger: null,
            });
          }
        } catch (expoError) {
          console.error("Erro ao verificar Expo OTA:", expoError);
        }
      }

      const githubUpdate = await checkGitHubUpdate();
      const hasGitHubUpdate = !!githubUpdate;

      if (hasGitHubUpdate && githubUpdate) {
        setUpdateInfo((prev) => ({
          ...prev,
          isAvailable: true,
          source: "github",
          githubInfo: githubUpdate,
        }));
        return true;
      }

      return hasExpoUpdate;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao verificar atualizações";
      setError(errorMessage);
      console.error("Erro ao verificar atualizações:", err);
      return false;
    }
  }, [checkGitHubUpdate]);

  // Baixar e instalar atualização (fluxo completo)
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
        // Atualização via GitHub - fluxo com DocumentPicker
        Alert.alert(
          `Atualização ${updateInfo.githubInfo.version}`,
          `${updateInfo.githubInfo.releaseNotes}\n\n` +
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

                setTimeout(async () => {
                  Alert.alert(
                    "APK Baixado",
                    "Por favor, selecione o arquivo APK baixado",
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
                    ]
                  );
                }, 5000); // Esperar 5 segundos para o download
              },
            },
          ]
        );
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
  }, [updateInfo, openAPKFilePicker, installAPK]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        await checkForUpdates();
      } catch (err) {
        console.error("Erro na inicialização do update manager:", err);
      }
    };

    initialize();
  }, [checkForUpdates]);

  return {
    updateInfo,
    updateProgress,
    error,
    githubRelease,
    checkForUpdates,
    downloadAndInstallUpdate,
    openAPKFilePicker,
    installAPK,
  };
};
