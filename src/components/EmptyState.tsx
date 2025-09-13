import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionText?: string;
  onActionPress?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "document-text-outline",
  title,
  message,
  actionText,
  onActionPress,
}) => {
  return (
    <View style={emptyStyles.container}>
      <Ionicons
        name={icon as any}
        size={64}
        color="#9ca3af"
        style={emptyStyles.icon}
      />
      <Text style={emptyStyles.title}>{title}</Text>
      {message && <Text style={emptyStyles.message}>{message}</Text>}

      {actionText && onActionPress && (
        <TouchableOpacity onPress={onActionPress} style={emptyStyles.button}>
          <Text style={emptyStyles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#375566",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
});

export default EmptyState;
