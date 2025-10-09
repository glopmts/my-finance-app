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
    downloadUpdate,
    installUpdate,
  } = useOTAUpdate();

  const [showAlert, setShowAlert] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showInstallScreen, setShowInstallScreen] = useState(false);

  // Verificar atualizações ao montar o componente
  useEffect(() => {
    const checkUpdates = async () => {
      const hasUpdate = await checkForUpdates();
      if (hasUpdate) {
        setShowAlert(true);
      }
    };

    checkUpdates();
  }, [checkForUpdates]);

  // Monitorar progresso do download
  useEffect(() => {
    if (updateProgress.isDownloading) {
      setShowProgress(true);
    } else if (
      updateProgress.progress === 100 &&
      !updateProgress.isInstalling
    ) {
      setShowProgress(false);
      setShowInstallScreen(true);
    }
  }, [updateProgress]);

  const handleDownload = async () => {
    setShowAlert(false);
    const success = await downloadUpdate();

    if (!success) {
      // Se falhar, pode mostrar o alerta novamente ou uma mensagem de erro
      setShowProgress(false);
    }
  };

  const handleCancel = () => {
    setShowAlert(false);
  };

  const handleInstall = async () => {
    await installUpdate();
  };

  return (
    <View style={{ flex: 1 }}>
      {children}

      <UpdateAlert
        visible={showAlert}
        onDownload={handleDownload}
        onCancel={handleCancel}
      />

      <UpdateProgress
        visible={showProgress}
        progress={updateProgress.progress}
        isDownloading={updateProgress.isDownloading}
        isInstalling={updateProgress.isInstalling}
      />

      <InstallUpdateScreen
        visible={showInstallScreen}
        onInstall={handleInstall}
      />
    </View>
  );
};
