import { InlineLoading } from "@/components/Loading";
import { useTheme } from "@/contexts/ThemeContext";
import { useClerkUser } from "@/hooks/useClerkUser";
import { API_BASE_URL } from "@/lib/api-from-url";
import { useTransactionsQuery } from "@/services/query/transactions.query";
import { Transaction } from "@/types/transaction-props";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

export default function UploadFile({ onUploadSuccess }: UploadFileProps) {
  const { theme } = useTheme();
  const { user, loading } = useClerkUser();
  const userId = user?.id || "";
  const { refetchTransactions } = useTransactionsQuery(userId);

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] =
    useState<DocumentPickerResponse | null>(null);

  const selectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "text/csv",
          "application/vnd.ms-excel",
          "application/csv",
          "text/comma-separated-values",
          "text/plain",
        ],
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

      if (response.status !== 200) {
        throw new Error(data.error || data.details || "Erro no upload");
      }

      Alert.alert(
        "Sucesso",
        `Upload realizado com sucesso! ${data.savedCount || 0} transações processadas.`
      );

      onUploadSuccess(data);
      refetchTransactions();
      setSelectedFile(null);
    } catch (err) {
      Alert.alert(
        "Erro",
        err instanceof Error ? err.message : "Erro ao fazer upload do arquivo"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  if (loading) {
    return <InlineLoading message="Carregando..." size="large" />;
  }

  return (
    <View
      className={`p-4 flex-1 ${Platform.OS === "android" ? "pt-20" : ""}`}
      style={{ backgroundColor: theme.background }}
    >
      {/* Card de Upload */}
      <TouchableOpacity
        className="border-2 border-dashed rounded-xl p-8 items-center"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.borderDashed,
        }}
        onPress={selectFile}
        disabled={isUploading}
        activeOpacity={0.7}
      >
        <View className="items-center">
          <View className="mb-4">
            <Text className="text-5xl">📤</Text>
          </View>

          <Text
            className="text-lg font-semibold mb-2 text-center"
            style={{ color: theme.text }}
          >
            Toque para fazer upload de arquivo
          </Text>
          <Text
            className="text-sm text-center mb-4"
            style={{ color: theme.textSecondary }}
          >
            Formatos suportados: PDF ou CSV (máx. 10MB)
          </Text>

          {/* Info Box */}
          <View
            className="rounded-lg p-4 border flex-row items-start w-full"
            style={{
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
            }}
          >
            <Text className="text-xl mr-3">
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={theme.textSecondary}
              />
            </Text>
            <View className="flex-1">
              <Text
                className="text-sm font-medium mb-1"
                style={{ color: theme.text }}
              >
                Formato CSV esperado:
              </Text>
              <Text
                className="text-xs px-2 py-1 rounded font-mono"
                style={{
                  backgroundColor: theme.backgroundTertiary,
                  color: theme.textSecondary,
                }}
              >
                Data, Valor, Descrição
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Arquivo Selecionado */}
      {selectedFile && (
        <View
          className="mt-4 rounded-xl p-4 border"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <View className="flex-row items-center mb-4">
            <Text className="text-3xl mr-3">📄</Text>
            <View className="flex-1">
              <Text
                className="text-base font-medium mb-1"
                style={{ color: theme.text }}
              >
                {selectedFile.name}
              </Text>
              <Text className="text-sm" style={{ color: theme.textSecondary }}>
                {selectedFile.size
                  ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                  : "Tamanho desconhecido"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={removeSelectedFile}
              disabled={isUploading}
              className="p-2 rounded"
              style={{ backgroundColor: theme.backgroundSecondary }}
              activeOpacity={0.7}
            >
              <Text className="text-lg" style={{ color: theme.textSecondary }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botões de Ação */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-3 px-4 rounded-lg items-center justify-center border"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
              onPress={removeSelectedFile}
              disabled={isUploading}
              activeOpacity={0.7}
            >
              <Text
                className="font-medium text-base"
                style={{ color: theme.text }}
              >
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-lg items-center justify-center ${isUploading ? "opacity-60" : ""}`}
              style={{
                backgroundColor: theme.primary,
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              }}
              onPress={handleUpload}
              disabled={isUploading}
              activeOpacity={0.8}
            >
              {isUploading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text className="text-white font-semibold ml-2 text-base">
                    Enviando...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-5xl">📤</Text>
                  <Text className="text-white font-semibold ml-2 text-base">
                    Enviar
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
