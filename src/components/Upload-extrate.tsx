import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../lib/api-from-url";
import { Transaction } from "../types/transaction-props";

interface UploadResult {
  message: string;
  transactions: Transaction[];
  totalCount: number;
  savedCount: number;
  fileType: string;
  count: number;
}

interface UploadFileProps {
  onUploadSuccess: (data: UploadResult) => void;
  userId: string;
  refetch: () => void;
}

interface DocumentPickerResponse {
  uri: string;
  name: string;
  type?: string;
  size?: number;
  fileCopyUri?: string;
}

export default function UploadFile({
  userId,
  onUploadSuccess,
  refetch,
}: UploadFileProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] =
    useState<DocumentPickerResponse | null>(null);

  const selectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/csv"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) {
        return;
      }
      const file = result.assets[0];
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert("Erro", "Arquivo muito grande. Tamanho máximo: 10MB");
        return;
      }
      setSelectedFile(file);
    } catch (err) {
      Alert.alert("Erro", "Erro ao selecionar arquivo");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();

    formData.append("file", {
      uri: selectedFile.uri,
      type: selectedFile.type || "application/octet-stream",
      name: selectedFile.name,
    } as any);

    formData.append("userId", userId);

    setIsUploading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/upload/creater`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.status === 200) {
        Alert.alert(
          "Sucesso",
          `Upload realizado com sucesso! ${data.savedCount || 0} transações processadas.`
        );
      }
      onUploadSuccess(data);
      refetch();
      setSelectedFile(null);
    } catch (err) {
      Alert.alert(
        "Erro",
        err instanceof Error ? err.message : "Erro ao fazer upload do arquivo"
      );
      setIsUploading(false);
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  return (
    <View style={styles.container}>
      {/* Card de Upload */}
      <TouchableOpacity
        style={styles.uploadCard}
        onPress={selectFile}
        disabled={isUploading}
      >
        <View style={styles.uploadContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.uploadIcon}>📤</Text>
          </View>

          <Text style={styles.uploadTitle}>
            Toque para fazer upload de arquivo
          </Text>
          <Text style={styles.uploadSubtitle}>
            Formatos suportados: PDF ou CSV (máx. 10MB)
          </Text>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Formato CSV esperado:</Text>
              <Text style={styles.infoCode}>Data, Valor, Descrição</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Arquivo Selecionado */}
      {selectedFile && (
        <View style={styles.selectedFileContainer}>
          <View style={styles.fileInfo}>
            <Text style={styles.fileIcon}>📄</Text>
            <View style={styles.fileDetails}>
              <Text style={styles.fileName}>{selectedFile.name}</Text>
              <Text style={styles.fileSize}>
                {selectedFile.size
                  ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                  : "Tamanho desconhecido"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={removeSelectedFile}
              disabled={isUploading}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Botões de Ação */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={removeSelectedFile}
              disabled={isUploading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.uploadButton,
                isUploading && styles.disabledButton,
              ]}
              onPress={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <View style={styles.uploadingContent}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.uploadButtonText}>Enviando...</Text>
                </View>
              ) : (
                <View style={styles.uploadingContent}>
                  <Text style={styles.uploadIcon}>📤</Text>
                  <Text style={styles.uploadButtonText}>Enviar</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  uploadCard: {
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    padding: 32,
    alignItems: "center",
  },
  uploadContent: {
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  uploadIcon: {
    fontSize: 48,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  uploadSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  infoCode: {
    fontSize: 12,
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: "#4b5563",
    fontFamily: "monospace",
  },
  selectedFileContainer: {
    marginTop: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  fileIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: "#6b7280",
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 18,
    color: "#6b7280",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "500",
  },
  uploadButton: {
    backgroundColor: "#3b82f6",
  },
  disabledButton: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: "#ffffff",
    fontWeight: "500",
    marginLeft: 8,
  },
  uploadingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});
