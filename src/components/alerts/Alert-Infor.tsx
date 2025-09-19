import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type AlertType = "info" | "success" | "warning" | "error";

interface AlertProps {
  type?: AlertType;
  title: string;
  message?: string;
  actionText?: string;
  onActionPress?: () => void;
  showIcon?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  message,
  actionText,
  onActionPress,
  showIcon = true,
}) => {
  const getAlertStyles = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "#f0fdf4",
          borderColor: "#bbf7d0",
          iconColor: "#22c55e",
          iconName: "checkmark-circle" as const,
        };
      case "warning":
        return {
          backgroundColor: "#fffbeb",
          borderColor: "#fde68a",
          iconColor: "#f59e0b",
          iconName: "warning" as const,
        };
      case "error":
        return {
          backgroundColor: "#fef2f2",
          borderColor: "#fecaca",
          iconColor: "#ef4444",
          iconName: "close-circle" as const,
        };
      default: // info
        return {
          backgroundColor: "#eff6ff",
          borderColor: "#bfdbfe",
          iconColor: "#3b82f6",
          iconName: "information-circle" as const,
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <View
      style={[
        alertStyles.container,
        {
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor,
        },
      ]}
    >
      <View style={alertStyles.content}>
        {showIcon && (
          <Ionicons
            name={styles.iconName}
            size={24}
            color={styles.iconColor}
            style={alertStyles.icon}
          />
        )}

        <View style={alertStyles.textContainer}>
          <Text style={alertStyles.title}>{title}</Text>
          {message && <Text style={alertStyles.message}>{message}</Text>}
        </View>
      </View>

      {actionText && onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          style={alertStyles.actionButton}
        >
          <Text style={[alertStyles.actionText, { color: styles.iconColor }]}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const alertStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Alert;
