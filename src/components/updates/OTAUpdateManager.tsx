import type React from "react";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useOTAUpdate } from "../../hooks/useOTAUpdate";
import { InstallUpdateScreen } from "./InstallUpdateScreen";
import { UpdateAlert } from "./UpdateAlert";
import { UpdateProgress } from "./UpdateProgress";

interface OTAUpdateManagerProps {
  children: React.ReactNode;
}

export const OTAUpdateManager: React.FC<OTAUpdateManagerProps> = ({
  children,
}) => {
  const {
    updateInfo,
    updateProgress,
    checkForUpdates,
    downloadAndInstallUpdate,
    error,
    githubRelease,
  } = useOTAUpdate();

  const [showAlert, setShowAlert] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showInstallScreen, setShowInstallScreen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUpdates = async () => {
      try {
        setIsChecking(true);
        const hasUpdate = await checkForUpdates();

        if (hasUpdate) {
          setShowAlert(true);
        }
      } catch (err) {
        console.error("Erro ao verificar atualizações:", err);
      } finally {
        setIsChecking(false);
      }
    };

    const timer = setTimeout(() => {
      checkUpdates();
    }, 3000);

    return () => clearTimeout(timer);
  }, [checkForUpdates]);

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
    }
  }, [updateProgress, updateInfo.source]);

  useEffect(() => {
    if (error) {
      console.error("Erro no gerenciador de atualizações:", error);
    }
  }, [error]);

  const handleDownload = async () => {
    try {
      setShowAlert(false);
      setShowProgress(true);

      await downloadAndInstallUpdate();
    } catch (err) {
      console.error("Erro ao iniciar download:", err);
      setShowProgress(false);
    }
  };

  const handleCancel = () => {
    setShowAlert(false);
  };

  const handleInstall = async () => {
    try {
      setShowInstallScreen(false);
      setShowProgress(true);

      if (updateInfo.source === "expo") {
      }
    } catch (err) {
      console.error("Erro na instalação:", err);
      setShowProgress(false);
    }
  };

  if (isChecking) {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <View style={{ flex: 1 }}>
      {children}

      {/* Alerta de atualização disponível */}
      <UpdateAlert
        visible={showAlert && updateInfo.isAvailable}
        updateInfo={updateInfo}
        githubRelease={githubRelease}
        onDownload={handleDownload}
        onCancel={handleCancel}
      />

      {/* Tela de progresso (download/instalação) */}
      <UpdateProgress
        visible={showProgress}
        progress={updateProgress.progress}
        isDownloading={updateProgress.isDownloading}
        isInstalling={updateProgress.isInstalling}
        source={updateInfo.source}
      />

      {/* Tela de confirmação para instalação OTA (só para Expo) */}
      <InstallUpdateScreen
        visible={showInstallScreen && updateInfo.source === "expo"}
        onInstall={handleInstall}
        onCancel={() => setShowInstallScreen(false)}
      />
    </View>
  );
};
