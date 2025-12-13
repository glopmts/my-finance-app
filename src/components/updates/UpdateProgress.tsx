import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";

interface UpdateProgressProps {
  visible: boolean;
  progress: number;
  isDownloading: boolean;
  isInstalling: boolean;
  source?: "expo" | "github";
}

export const UpdateProgress: React.FC<UpdateProgressProps> = ({
  visible,
  progress,
  isDownloading,
  isInstalling,
  source,
}) => {
  if (!visible) return null;

  const getTitle = () => {
    if (isDownloading) {
      return source === "github"
        ? "Baixando APK..."
        : "Baixando atualização...";
    }
    if (isInstalling) {
      return "Instalando atualização...";
    }
    return "Processando...";
  };

  const getDescription = () => {
    if (source === "github" && isDownloading) {
      return "O APK está sendo baixado. Em seguida, você será solicitado a instalá-lo.";
    }
    if (isInstalling) {
      return "O aplicativo será reiniciado automaticamente.";
    }
    return "Aguarde enquanto processamos a atualização...";
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            {isDownloading || isInstalling ? (
              <ActivityIndicator size={48} color="#007AFF" />
            ) : (
              <Ionicons
                name="cloud-download-outline"
                size={48}
                color="#007AFF"
              />
            )}
          </View>

          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.description}>{getDescription()}</Text>

          {(isDownloading || isInstalling) && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          )}

          {source === "github" && isDownloading && progress === 100 && (
            <View style={styles.noteContainer}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#666"
              />
              <Text style={styles.noteText}>
                Em breve você será redirecionado para instalar o APK
              </Text>
            </View>
          )}
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
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  progressContainer: {
    width: "100%",
    marginTop: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E5EA",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  noteText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
});
