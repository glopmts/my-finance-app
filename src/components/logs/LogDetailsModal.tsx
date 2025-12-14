import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LogLevel } from "./LogItem";

type LogDetailsModalProps = {
  visible: boolean;
  log: {
    id: string;
    timestamp: Date;
    level: LogLevel;
    message: string;
    source: string;
    details?: Record<string, any>;
    userId?: string;
    deviceInfo?: {
      platform: string;
      version: string;
    };
  } | null;
  onClose: () => void;
};

export const LogDetailsModal: React.FC<LogDetailsModalProps> = ({
  visible,
  log,
  onClose,
}) => {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        modalOverlay: {
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        },
        modalContent: {
          backgroundColor: theme.theme.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: "80%",
          paddingBottom: Platform.OS === "ios" ? 34 : 20,
        },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: theme.theme.border,
        },
        headerTitle: {
          fontSize: 20,
          fontWeight: "bold",
          color: theme.theme.text,
        },
        content: {
          padding: 20,
        },
        section: {
          marginBottom: 24,
        },
        sectionTitle: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.theme.text,
          marginBottom: 12,
        },
        infoRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: theme.theme.borderSecondary,
        },
        infoLabel: {
          fontSize: 14,
          color: theme.theme.textSecondary,
        },
        infoValue: {
          fontSize: 14,
          color: theme.theme.text,
          fontWeight: "500",
          textAlign: "right",
          flex: 1,
          marginLeft: 10,
        },
        detailsContainer: {
          backgroundColor: theme.theme.backgroundSecondary,
          borderRadius: 8,
          padding: 12,
          marginTop: 8,
        },
        detailsText: {
          fontSize: 14,
          color: theme.theme.text,
          fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        },
        copyButton: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.theme.primary,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 12,
          marginTop: 20,
          justifyContent: "center",
        },
        copyButtonText: {
          color: "#fff",
          fontSize: 16,
          fontWeight: "600",
          marginLeft: 8,
        },
      }),
    [theme]
  );

  if (!log) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleCopyToClipboard = () => {
    const logText = JSON.stringify(log, null, 2);
    // Aqui você implementaria a cópia para clipboard
    // Por exemplo, usando Clipboard.setStringAsync do expo-clipboard
    alert("Log copiado para a área de transferência!");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Detalhes do Log</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações Básicas</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID:</Text>
                <Text style={styles.infoValue}>{log.id}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Data/Hora:</Text>
                <Text style={styles.infoValue}>
                  {formatDate(log.timestamp)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nível:</Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color:
                        log.level === "error"
                          ? theme.theme.error
                          : log.level === "warn"
                            ? theme.theme.warning
                            : log.level === "info"
                              ? theme.theme.info
                              : theme.theme.textSecondary,
                    },
                  ]}
                >
                  {log.level.toUpperCase()}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fonte:</Text>
                <Text style={styles.infoValue}>{log.source}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mensagem</Text>
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsText}>{log.message}</Text>
              </View>
            </View>

            {log.details && Object.keys(log.details).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detalhes</Text>
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsText}>
                    {JSON.stringify(log.details, null, 2)}
                  </Text>
                </View>
              </View>
            )}

            {(log.userId || log.deviceInfo) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contexto</Text>

                {log.userId && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Usuário:</Text>
                    <Text style={styles.infoValue}>{log.userId}</Text>
                  </View>
                )}

                {log.deviceInfo && (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Plataforma:</Text>
                      <Text style={styles.infoValue}>
                        {log.deviceInfo.platform}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Versão:</Text>
                      <Text style={styles.infoValue}>
                        {log.deviceInfo.version}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyToClipboard}
            >
              <Ionicons name="copy-outline" size={20} color="#fff" />
              <Text style={styles.copyButtonText}>Copiar Log</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
