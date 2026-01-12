import { StyleSheet } from "react-native";

export const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? "#09090b" : "#ffffff",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? "#27272a" : "#e4e4e7",
      overflow: "hidden",
    },
    loadingContainer: {
      padding: 24,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 200,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: isDark ? "#a1a1aa" : "#71717a",
    },
    errorContainer: {
      padding: 24,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 200,
    },
    errorText: {
      marginTop: 16,
      fontSize: 16,
      color: isDark ? "#f87171" : "#dc2626",
      textAlign: "center",
    },
    retryButton: {
      marginTop: 16,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: isDark ? "#3b82f6" : "#2563eb",
      borderRadius: 6,
    },
    retryButtonText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "500",
    },
    emptyContainer: {
      padding: 24,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 200,
    },
    emptyText: {
      fontSize: 16,
      color: isDark ? "#71717a" : "#a1a1aa",
      textAlign: "center",
    },
    header: {
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#27272a" : "#e4e4e7",
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: isDark ? "#27272a" : "#f4f4f5",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#f4f4f5" : "#18181b",
    },
    monthText: {
      fontSize: 14,
      color: isDark ? "#71717a" : "#a1a1aa",
    },
    navigationContainer: {
      flexDirection: "row",
      backgroundColor: isDark ? "#18181b" : "#f9fafb",
      borderRadius: 8,
      padding: 4,
      gap: 4,
    },
    navButton: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    currentMonthButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: isDark ? "#27272a" : "#e4e4e7",
      borderRadius: 6,
      alignSelf: "flex-start",
    },
    currentMonthButtonText: {
      fontSize: 12,
      color: isDark ? "#a1a1aa" : "#71717a",
    },
    content: {
      padding: 24,
      gap: 24,
    },
    amountContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
    amountLabel: {
      fontSize: 14,
      color: isDark ? "#71717a" : "#a1a1aa",
      marginBottom: 4,
    },
    amountValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: isDark ? "#f4f4f5" : "#18181b",
    },
    remainingContainer: {
      alignItems: "flex-end",
    },
    remainingLabel: {
      fontSize: 14,
      color: isDark ? "#71717a" : "#a1a1aa",
      marginBottom: 4,
    },
    remainingValue: {
      fontSize: 18,
      fontWeight: "600",
    },
    progressSection: {
      gap: 12,
    },
    progressContainer: {
      height: 12,
      borderRadius: 6,
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      borderRadius: 6,
    },
    progressLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    progressLabel: {
      fontSize: 14,
      color: isDark ? "#71717a" : "#a1a1aa",
    },
    alertContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      backgroundColor: isDark ? "rgba(220, 38, 38, 0.1)" : "#fef2f2",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? "rgba(220, 38, 38, 0.3)" : "#fecaca",
    },
    alertText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#fca5a5" : "#b91c1c",
    },
    percentageContainer: {
      alignItems: "center",
    },
    percentageText: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#9ca3af" : "#6b7280",
    },
  });
