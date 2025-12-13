import type React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface UpdateAlertProps {
  visible: boolean;
  updateInfo?: any;
  githubRelease?: any;
  onDownload: () => void;
  onCancel: () => void;
}

export const UpdateAlert: React.FC<UpdateAlertProps> = ({
  visible,
  updateInfo,
  githubRelease,
  onDownload,
  onCancel,
}) => {
  if (!visible) return null;

  const getTitle = () => {
    if (updateInfo?.source === "github" && githubRelease) {
      return `Atualização ${githubRelease.version}`;
    }
    return "Atualização Disponível!";
  };

  const getDescription = () => {
    if (updateInfo?.source === "github" && githubRelease) {
      return githubRelease.releaseNotes;
    }
    return "Uma nova versão do aplicativo está disponível. Recomendamos que atualize para a versão mais recente.";
  };

  const getButtonText = () => {
    if (updateInfo?.source === "github") {
      return "Baixar APK";
    }
    return "Baixar e Instalar";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.message}>{getDescription()}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.downloadButton]}
              onPress={onDownload}
              activeOpacity={0.7}
            >
              <Text style={styles.downloadButtonText}>{getButtonText()}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
  },
  downloadButton: {
    backgroundColor: "#007AFF",
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
