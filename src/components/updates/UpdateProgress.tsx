import type React from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface UpdateProgressProps {
  visible: boolean;
  progress: number;
  isDownloading: boolean;
  isInstalling: boolean;
}

export const UpdateProgress: React.FC<UpdateProgressProps> = ({
  visible,
  progress,
  isDownloading,
  isInstalling,
}) => {
  const getStatusText = () => {
    if (isDownloading) return "Baixando atualização...";
    if (isInstalling) return "Instalando atualização...";
    return "Preparando...";
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.progressContainer}>
          <ActivityIndicator size="large" color="#007AFF" />

          <Text style={styles.statusText}>{getStatusText()}</Text>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>

          <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
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
  progressContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
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
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
});
