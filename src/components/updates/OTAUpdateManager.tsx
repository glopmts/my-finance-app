// OTAUpdateManager.tsx - versão corrigida
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { AppState, View } from "react-native";
import { useOTAUpdate } from "../../hooks/use-updates-app";
import { InstallUpdateScreen } from "./InstallUpdateScreen";
import { UpdateAlert } from "./UpdateAlert";
import { UpdateProgress } from "./UpdateProgress";

interface OTAUpdateManagerProps {
  children: React.ReactNode;
  checkOnStart?: boolean;
  checkInterval?: number;
}

export const OTAUpdateManager: React.FC<OTAUpdateManagerProps> = ({
  children,
  checkOnStart = true,
  checkInterval = 24 * 60 * 60 * 1000,
}) => {
  const {
    updateInfo,
    updateProgress,
    checkForUpdates,
    downloadAndInstallUpdate,
    error,
    githubRelease,
    hasChecked,
  } = useOTAUpdate();

  const [showAlert, setShowAlert] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showInstallScreen, setShowInstallScreen] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<number | null>(null);

  const shouldCheckUpdates = useCallback(() => {
    if (!checkOnStart) return false;
    if (hasChecked) return false;

    if (!lastCheckTime) return true;

    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckTime;

    return timeSinceLastCheck >= checkInterval;
  }, [checkOnStart, hasChecked, lastCheckTime, checkInterval]);

  // Verificação inicial
  useEffect(() => {
    if (!shouldCheckUpdates()) return;

    const checkUpdates = async () => {
      try {
        const hasUpdate = await checkForUpdates();

        if (hasUpdate) {
          setShowAlert(true);
        }

        setLastCheckTime(Date.now());
      } catch (err) {
        console.error("Erro ao verificar atualizações:", err);
      }
    };

    const timer = setTimeout(() => {
      checkUpdates();
    }, 3000);

    return () => clearTimeout(timer);
  }, [checkForUpdates, shouldCheckUpdates]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        if (shouldCheckUpdates()) {
          setTimeout(() => {
            checkForUpdates();
            setLastCheckTime(Date.now());
          }, 1000);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkForUpdates, shouldCheckUpdates]);

  // Monitorar progresso
  useEffect(() => {
    if (updateProgress.isDownloading) {
      setShowProgress(true);
      setShowAlert(false);
    } else if (
      updateProgress.progress === 100 &&
      !updateProgress.isInstalling &&
      !updateProgress.isDownloading
    ) {
      if (updateInfo.source === "expo") {
        setShowProgress(false);
        setShowInstallScreen(true);
      } else {
        setShowProgress(false);
      }
    } else if (updateProgress.isInstalling) {
      setShowProgress(true);
    } else {
      setShowProgress(false);
    }
  }, [updateProgress, updateInfo.source]);

  const handleDownload = async () => {
    try {
      setShowAlert(false);
      await downloadAndInstallUpdate();
    } catch (err) {
      console.error("Erro ao iniciar download:", err);
      setShowAlert(true);
    }
  };

  const handleCancel = () => {
    setShowAlert(false);
  };

  const handleInstall = async () => {
    try {
      setShowInstallScreen(false);
    } catch (err) {
      console.error("Erro na instalação:", err);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {children}

      <UpdateAlert
        visible={showAlert && updateInfo.isAvailable}
        updateInfo={updateInfo}
        githubRelease={githubRelease}
        onDownload={handleDownload}
        onCancel={handleCancel}
      />

      <UpdateProgress
        visible={showProgress}
        progress={updateProgress.progress}
        isDownloading={updateProgress.isDownloading}
        isInstalling={updateProgress.isInstalling}
        source={updateInfo.source}
      />

      <InstallUpdateScreen
        visible={showInstallScreen && updateInfo.source === "expo"}
        onInstall={handleInstall}
        onCancel={() => setShowInstallScreen(false)}
      />
    </View>
  );
};
