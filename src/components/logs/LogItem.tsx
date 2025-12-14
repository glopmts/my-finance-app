import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export type LogLevel = "info" | "warn" | "error" | "debug";

export type LogItemProps = {
  log: {
    id: string;
    timestamp: Date;
    level: LogLevel;
    message: string;
    source: string;
    details?: Record<string, any>;
  };
};

export const LogItem: React.FC<LogItemProps> = ({ log }) => {
  const theme = useTheme();

  const getLevelConfig = (level: LogLevel) => {
    switch (level) {
      case "info":
        return {
          icon: "information-circle",
          color: theme.theme.info,
          bgColor: theme.theme.info + "20",
          label: "INFO",
        };
      case "warn":
        return {
          icon: "warning",
          color: theme.theme.warning,
          bgColor: theme.theme.warning + "20",
          label: "WARN",
        };
      case "error":
        return {
          icon: "alert-circle",
          color: theme.theme.error,
          bgColor: theme.theme.error + "20",
          label: "ERROR",
        };
      case "debug":
        return {
          icon: "bug",
          color: theme.theme.textSecondary,
          bgColor: theme.theme.textSecondary + "20",
          label: "DEBUG",
        };
    }
  };

  const levelConfig = getLevelConfig(log.level);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.theme.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 10,
          borderLeftWidth: 4,
          borderLeftColor: levelConfig.color,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: theme.isDark ? 0.2 : 0.05,
          shadowRadius: 2,
          elevation: 2,
        },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        },
        levelBadge: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: levelConfig.bgColor,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 20,
        },
        levelText: {
          color: levelConfig.color,
          fontSize: 12,
          fontWeight: "600",
          marginLeft: 4,
        },
        timeText: {
          fontSize: 12,
          color: theme.theme.textTertiary,
        },
        messageText: {
          fontSize: 16,
          color: theme.theme.text,
          marginBottom: 8,
          lineHeight: 22,
        },
        sourceRow: {
          flexDirection: "row",
          alignItems: "center",
          marginTop: 4,
        },
        sourceLabel: {
          fontSize: 12,
          color: theme.theme.textSecondary,
          marginRight: 6,
        },
        sourceText: {
          fontSize: 12,
          color: theme.theme.text,
          fontWeight: "500",
        },
        detailsIndicator: {
          flexDirection: "row",
          alignItems: "center",
          marginTop: 8,
        },
        detailsText: {
          fontSize: 12,
          color: theme.theme.textSecondary,
          marginLeft: 4,
        },
      }),
    [theme, levelConfig]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Ionicons
            name={levelConfig.icon as any}
            size={14}
            color={levelConfig.color}
          />
          <Text style={styles.levelText}>{levelConfig.label}</Text>
        </View>
        <Text style={styles.timeText}>
          {log.timestamp.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </Text>
      </View>

      <Text style={styles.messageText} numberOfLines={2}>
        {log.message}
      </Text>

      <View style={styles.sourceRow}>
        <Text style={styles.sourceLabel}>Fonte:</Text>
        <Text style={styles.sourceText}>{log.source}</Text>
      </View>

      {log.details && (
        <View style={styles.detailsIndicator}>
          <Ionicons name="list" size={14} color={theme.theme.textSecondary} />
          <Text style={styles.detailsText}>
            {Object.keys(log.details).length} detalhes disponíveis
          </Text>
        </View>
      )}
    </View>
  );
};
