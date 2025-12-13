import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useOTAUpdate } from "../../hooks/useOTAUpdate";

export const UpdateScreen = ({ onClose }: { onClose: () => void }) => {
  const {
    updateInfo,
    updateProgress,
    error,
    githubRelease,
    checkForUpdates,
    downloadAndInstallUpdate,
    openAPKFilePicker,
    installAPK,
  } = useOTAUpdate();

  const [manualMode, setManualMode] = useState(false);

  const handleManualInstall = async () => {
    const apkUri = await openAPKFilePicker();
    if (apkUri) {
      await installAPK(apkUri);
    }
  };

  const handleDownloadAndInstall = async () => {
    if (updateInfo.source === "github" && githubRelease?.downloadUrl) {
      // Abrir navegador para download
      Linking.openURL(githubRelease.downloadUrl);

      // Perguntar após alguns segundos
      setTimeout(() => {
        Alert.alert(
          "APK Baixado?",
          'Após baixar o APK, clique em "Selecionar APK" para instalá-lo.',
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Selecionar APK",
              onPress: handleManualInstall,
            },
          ]
        );
      }, 5000);
    } else {
      await downloadAndInstallUpdate();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Atualizações</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={checkForUpdates}
        >
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status da Atualização</Text>

        <View style={styles.statusRow}>
          <Ionicons
            name={updateInfo.isAvailable ? "alert-circle" : "checkmark-circle"}
            size={24}
            color={updateInfo.isAvailable ? "#FF9500" : "#34C759"}
          />
          <Text style={styles.statusText}>
            {updateInfo.isAvailable
              ? "Atualização disponível"
              : "App atualizado"}
          </Text>
        </View>

        {updateInfo.source && (
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceText}>
              Fonte:{" "}
              {updateInfo.source === "github" ? "GitHub Release" : "Expo OTA"}
            </Text>
          </View>
        )}
      </View>

      {githubRelease && (
        <View style={styles.releaseCard}>
          <View style={styles.releaseHeader}>
            <Ionicons name="logo-github" size={24} color="#333" />
            <Text style={styles.releaseTitle}>GitHub Release</Text>
          </View>

          <View style={styles.releaseInfo}>
            <Text style={styles.releaseVersion}>
              Versão: {githubRelease.version}
            </Text>
            <Text style={styles.releaseDate}>
              Publicada em:{" "}
              {new Date(githubRelease.publishedAt).toLocaleDateString("pt-BR")}
            </Text>
          </View>

          <Text style={styles.releaseNotesLabel}>Notas da Versão:</Text>
          <ScrollView style={styles.notesContainer}>
            <Text style={styles.releaseNotes}>
              {githubRelease.releaseNotes}
            </Text>
          </ScrollView>

          {githubRelease.isMandatory && (
            <View style={styles.mandatoryBadge}>
              <Text style={styles.mandatoryText}>OBRIGATÓRIA</Text>
            </View>
          )}
        </View>
      )}

      {updateProgress.progress > 0 && (
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>
            {updateProgress.isDownloading ? "Baixando..." : "Instalando..."}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${updateProgress.progress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(updateProgress.progress)}%
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorCard}>
          <Ionicons name="warning" size={24} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {updateInfo.isAvailable ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleDownloadAndInstall}
              disabled={
                updateProgress.isDownloading || updateProgress.isInstalling
              }
            >
              <Ionicons
                name="cloud-download-outline"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>
                {updateInfo.source === "github"
                  ? "Baixar e Instalar APK"
                  : "Instalar Atualização"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setManualMode(!manualMode)}
            >
              <Text style={styles.secondaryButtonText}>
                {manualMode ? "Ocultar Modo Manual" : "Modo Manual"}
              </Text>
            </TouchableOpacity>

            {manualMode && (
              <TouchableOpacity
                style={styles.manualButton}
                onPress={handleManualInstall}
              >
                <Ionicons
                  name="document-outline"
                  size={20}
                  color="#007AFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.manualButtonText}>
                  Selecionar APK Manualmente
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <TouchableOpacity
            style={[styles.checkButton]}
            onPress={checkForUpdates}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color="#007AFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.checkButtonText}>Verificar Atualizações</Text>
          </TouchableOpacity>
        )}
        <View style={{ paddingTop: 10 }}>
          <TouchableOpacity style={[styles.checkButton]} onPress={onClose}>
            <Text style={styles.checkButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Informações Importantes</Text>
        <Text style={styles.infoText}>
          • Atualizações via GitHub requerem Android 5.0+
        </Text>
        <Text style={styles.infoText}>
          • Permita &quot;Fontes Desconhecidas&quot; nas configurações
        </Text>
        <Text style={styles.infoText}>
          • Mantenha o app fechado durante a instalação
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  refreshButton: {
    padding: 8,
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#1C1C1E",
  },
  sourceBadge: {
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  sourceText: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "500",
  },
  releaseCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  releaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  releaseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginLeft: 10,
  },
  releaseInfo: {
    marginBottom: 15,
  },
  releaseVersion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 5,
  },
  releaseDate: {
    fontSize: 14,
    color: "#8E8E93",
  },
  releaseNotesLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 10,
  },
  notesContainer: {
    maxHeight: 200,
    marginBottom: 15,
  },
  releaseNotes: {
    fontSize: 14,
    color: "#3C3C43",
    lineHeight: 20,
  },
  mandatoryBadge: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  mandatoryText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  progressCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E5EA",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  errorCard: {
    backgroundColor: "#FFEBEE",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginVertical: 20,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
    alignItems: "center",
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  manualButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C7C7CC",
  },
  manualButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  checkButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  checkButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#F2F2F7",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#3C3C43",
    marginBottom: 5,
  },
});
