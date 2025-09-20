import { ColorSchemeName, Platform, StyleSheet } from "react-native";

export const createTransactionStyles = (colorScheme: ColorSchemeName) => {
  const isDark = colorScheme === "dark";

  const colors = {
    background: isDark ? "#18181b" : "#ffffff",
    surface: isDark ? "#27272a" : "#f3f4f6",
    text: isDark ? "#ffffff" : "#111827",
    textSecondary: isDark ? "#a1a1aa" : "#374151",
    textMuted: isDark ? "#71717a" : "#6b7280",
    placeholder: isDark ? "#71717a" : "#9ca3af",
    border: isDark ? "#3f3f46" : "#d1d5db",
    borderHover: isDark ? "#52525b" : "#9ca3af",
    error: "#ef4444",
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 18,
      paddingTop: Platform.OS === "ios" ? 16 : 32,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    typeContainer: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 24,
    },
    typeButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.surface,
      gap: 6,
    },
    typeButtonText: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: "500",
    },
    typeButtonTextActive: {
      color: "#fff",
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textSecondary,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginTop: 4,
    },
    amountInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.background,
    },
    currencySymbol: {
      fontSize: 18,
      color: colors.textMuted,
      marginRight: 8,
    },
    amountInput: {
      flex: 1,
      fontSize: 18,
      color: colors.text,
      paddingVertical: 12,
      borderWidth: 0,
    },
    charCount: {
      fontSize: 12,
      color: colors.placeholder,
      textAlign: "right",
      marginTop: 4,
    },
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      gap: 8,
      backgroundColor: colors.background,
    },
    dateButtonText: {
      fontSize: 16,
      color: colors.text,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor: colors.background,
    },
    picker: {
      height: 50,
      color: colors.text,
      backgroundColor: colors.background,
    },
    switchContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      marginBottom: 24,
    },
    switchLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    switchLabel: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 12,
      marginTop: 12,
    },
    button: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 8,
      gap: 8,
    },
    cancelButton: {
      backgroundColor: colors.surface,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textMuted,
    },
    submitButton: {
      backgroundColor: "#10b981",
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
    infoContainer: {
      marginTop: 16,
      padding: 12,
      backgroundColor: colorScheme === "dark" ? "#27272a" : "#f9fafb",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#3f3f46" : "#e5e7eb",
    },

    infoText: {
      fontSize: 12,
      color: colorScheme === "dark" ? "#a1a1aa" : "#6b7280",
      marginBottom: 4,
      fontStyle: "italic",
    },

    buttonDisabled: {
      opacity: 0.6,
      elevation: 0,
      shadowOpacity: 0,
    },

    charCountContainer: {
      alignItems: "flex-end",
      marginTop: 4,
    },
  });
};
