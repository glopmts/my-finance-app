import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useTransactionsQuery } from "../services/query/transactions.query";
import {
  addMonths,
  calculateTotalExpenses,
  calculateTotalExpensesByTypes,
  filterTransactionsByMonth,
  formatMonthName,
} from "../utils/dateUtils";

type PropsProgress = {
  userId: string;
  maxValue?: number;
  expenseTypes?: string[];
};

// Styles css
const getStyles = (isDark: boolean) =>
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

const ProgressBar: React.FC<{
  value: number;
  isOverLimit: boolean;
  isDark: boolean;
}> = ({ value, isOverLimit, isDark }) => {
  const progressWidth = Math.min(value, 100);
  const styles = getStyles(isDark);

  return (
    <View
      style={[
        styles.progressContainer,
        { backgroundColor: isDark ? "#27272a" : "#f4f4f5" },
      ]}
    >
      <View
        style={[
          styles.progressBar,
          {
            width: `${progressWidth}%`,
            backgroundColor: isOverLimit
              ? isDark
                ? "#dc2626"
                : "#ef4444"
              : isDark
                ? "#059669"
                : "#10b981",
          },
        ]}
      />
    </View>
  );
};
const ProgressSpending: React.FC<PropsProgress> = ({
  userId,
  maxValue = 10000,
  expenseTypes,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const {
    transactions,
    isLoadingTransactions,
    transactionsError,
    refetchTransactions,
  } = useTransactionsQuery(userId);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleMonthChange = (increment: number) => {
    const newDate = addMonths(selectedMonth, increment);
    setSelectedMonth(newDate);
  };

  const resetToCurrentMonth = () => {
    setSelectedMonth(new Date());
  };

  const isCurrentMonth = (): boolean => {
    const now = new Date();
    return (
      selectedMonth.getMonth() === now.getMonth() &&
      selectedMonth.getFullYear() === now.getFullYear()
    );
  };

  const styles = getStyles(isDark);

  if (isLoadingTransactions) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={isDark ? "#3b82f6" : "#2563eb"}
          />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </View>
    );
  }

  if (transactionsError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons
            name="error-outline"
            size={48}
            color={isDark ? "#ef4444" : "#dc2626"}
          />
          <Text style={styles.errorText}>
            Erro ao carregar dados: {String(transactionsError)}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetchTransactions()}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
        </View>
      </View>
    );
  }

  const monthlyTransactions = filterTransactionsByMonth(
    transactions,
    selectedMonth
  );
  const totalExpenses =
    expenseTypes && expenseTypes.length > 0
      ? calculateTotalExpensesByTypes(monthlyTransactions, expenseTypes)
      : calculateTotalExpenses(monthlyTransactions);

  const progressValue = Math.min((totalExpenses / maxValue) * 100, 100);
  const isOverLimit = totalExpenses > maxValue;
  const remainingBudget = maxValue - totalExpenses;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="trending-down"
                size={20}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
            </View>
            <View>
              <Text style={styles.title}>Controle de Gastos</Text>
              <Text style={styles.monthText}>
                {formatMonthName(selectedMonth)}
              </Text>
            </View>
          </View>

          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => handleMonthChange(-1)}
            >
              <MaterialIcons
                name="chevron-left"
                size={20}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => handleMonthChange(1)}
            >
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {!isCurrentMonth() && (
          <TouchableOpacity
            style={styles.currentMonthButton}
            onPress={resetToCurrentMonth}
          >
            <Text style={styles.currentMonthButtonText}>
              Voltar ao mês atual
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Amount Display */}
        <View style={styles.amountContainer}>
          <View>
            <Text style={styles.amountLabel}>Total gasto</Text>
            <Text style={styles.amountValue}>
              {totalExpenses.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </Text>
          </View>
          <View style={styles.remainingContainer}>
            <Text style={styles.remainingLabel}>
              {isOverLimit ? "Excedido" : "Restante"}
            </Text>
            <Text
              style={[
                styles.remainingValue,
                {
                  color: isOverLimit
                    ? isDark
                      ? "#f87171"
                      : "#dc2626"
                    : isDark
                      ? "#34d399"
                      : "#059669",
                },
              ]}
            >
              {Math.abs(remainingBudget).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <ProgressBar
            value={progressValue}
            isOverLimit={isOverLimit}
            isDark={isDark}
          />

          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>R$ 0</Text>
            <Text style={styles.progressLabel}>
              {maxValue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </Text>
          </View>
        </View>

        {/* Status Alert */}
        {isOverLimit && (
          <View style={styles.alertContainer}>
            <MaterialIcons
              name="warning"
              size={16}
              color={isDark ? "#f87171" : "#dc2626"}
            />
            <Text style={styles.alertText}>
              Limite mensal excedido em{" "}
              {Math.abs(remainingBudget).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </Text>
          </View>
        )}

        {/* Progress Percentage */}
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageText}>
            {progressValue.toFixed(1)}% do limite utilizado
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ProgressSpending;
