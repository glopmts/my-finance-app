import { useTransactionsQuery } from "@/services/query/transactions.query";
import { CATEGORY_CONFIG } from "@/types/category_config";
import { CategoryEnum } from "@/types/transaction-props";
import { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import CategoryIcon from "../ui/categoryIcon";
import Progress from "../ui/progress-props";

interface CategorySummary {
  name: string;
  amount: number;
  percentage: number;
  icon: any;
  color: string;
  originalCategory: CategoryEnum;
}

const CategoryTransactions = ({ userId }: { userId: string }) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const {
    isLoadingTransactions,
    transactions: allTransactions,
    transactionsError,
  } = useTransactionsQuery(userId);
  const deviceColorScheme = useColorScheme();

  const getTransactionsByMonth = useMemo(() => {
    if (!allTransactions) return [];

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    return allTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getFullYear() === year &&
        transactionDate.getMonth() === month
      );
    });
  }, [allTransactions, selectedMonth]);

  const changeMonth = (direction: "prev" | "next") => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const calculateCategories = (): CategorySummary[] => {
    const monthlyTransactions = getTransactionsByMonth;

    if (!monthlyTransactions || monthlyTransactions.length === 0) {
      return [];
    }

    const expenses = monthlyTransactions.filter(
      (transaction) => transaction.type === "EXPENSE"
    );

    if (expenses.length === 0) {
      return [];
    }

    const totalExpenses = expenses.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const categoryMap = new Map<CategoryEnum, number>();

    expenses.forEach((transaction) => {
      const currentAmount = categoryMap.get(transaction.category) || 0;
      categoryMap.set(transaction.category, currentAmount + transaction.amount);
    });

    const categoriesSummary: CategorySummary[] = Array.from(
      categoryMap.entries()
    )
      .map(([category, amount]) => {
        const config = CATEGORY_CONFIG[category];
        const percentage =
          totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

        return {
          name: config.name,
          amount,
          percentage: Math.round(percentage * 100) / 100,
          icon: config.icon,
          color: config.color,
          originalCategory: category,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return categoriesSummary;
  };

  const categories = calculateCategories();
  const monthName = selectedMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const monthlyStats = useMemo(() => {
    const monthlyTransactions = getTransactionsByMonth;

    if (!monthlyTransactions || monthlyTransactions.length === 0) {
      return { totalIncome: 0, totalExpenses: 0, balance: 0 };
    }

    const totalIncome = monthlyTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  }, [getTransactionsByMonth]);

  if (isLoadingTransactions) {
    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.title}>Gastos por Categoria</Text>
          <Text style={styles.subtitle}>Carregando...</Text>
        </View>
        <View style={styles.skeletonContainer}>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={styles.skeletonItem}>
              <View style={styles.skeletonRow}>
                <View style={styles.skeletonRowLeft}>
                  <View style={styles.skeletonIcon} />
                  <View>
                    <View style={styles.skeletonTextLarge} />
                    <View style={styles.skeletonTextSmall} />
                  </View>
                </View>
                <View style={styles.skeletonAmount} />
              </View>
              <Progress value={0} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (transactionsError) {
    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.title}>Gastos por Categoria</Text>
          <Text style={styles.errorText}>Erro ao carregar dados</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: deviceColorScheme === "dark" ? "#fff" : "#27272a",
        },
      ]}
    >
      <View>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Gastos por Categoria</Text>
            <Text style={styles.subtitle}>
              {monthName} - Total: R$ {monthlyStats.totalExpenses.toFixed(2)}
            </Text>
          </View>
          <View style={styles.monthSelector}>
            <TouchableOpacity
              onPress={() => changeMonth("prev")}
              style={styles.monthButton}
            >
              <Text>←</Text>
            </TouchableOpacity>
            <Text style={styles.monthText}>{monthName}</Text>
            <TouchableOpacity
              onPress={() => changeMonth("next")}
              style={styles.monthButton}
            >
              <Text>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Estatísticas rápidas */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.incomeText}>
              R$ {monthlyStats.totalIncome.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Receitas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.expenseText}>
              R$ {monthlyStats.totalExpenses.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Despesas</Text>
          </View>
          <View style={styles.statItem}>
            <Text
              style={[
                styles.balanceText,
                monthlyStats.balance >= 0
                  ? styles.positiveBalance
                  : styles.negativeBalance,
              ]}
            >
              R$ {monthlyStats.balance.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Saldo</Text>
          </View>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        {categories.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhuma despesa encontrada para {monthName}
          </Text>
        ) : (
          <View style={styles.categoriesList}>
            {categories.map((category) => {
              return (
                <View
                  key={category.originalCategory}
                  style={styles.categoryItem}
                >
                  <View style={styles.categoryRow}>
                    <View style={styles.categoryLeft}>
                      <CategoryIcon
                        category={category.originalCategory}
                        size={40}
                      />
                      <View>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.categoryPercentage}>
                          {category.percentage}% do total
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.categoryAmount}>
                      R$ {category.amount.toFixed(2)}
                    </Text>
                  </View>
                  <Progress value={category.percentage} />
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#18181b",
  },
  subtitle: {
    fontSize: 14,
    color: "#71717a",
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  monthButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f4f4f5",
  },
  monthText: {
    fontSize: 14,
    fontWeight: "500",
    minWidth: 120,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  incomeText: {
    color: "#16a34a",
    fontWeight: "600",
    fontSize: 14,
  },
  expenseText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 14,
  },
  balanceText: {
    fontWeight: "600",
    fontSize: 14,
  },
  positiveBalance: {
    color: "#16a34a",
  },
  negativeBalance: {
    color: "#dc2626",
  },
  statLabel: {
    color: "#71717a",
    fontSize: 12,
    marginTop: 2,
  },
  categoriesContainer: {
    marginTop: 16,
  },
  emptyText: {
    textAlign: "center",
    paddingVertical: 32,
    color: "#71717a",
  },
  categoriesList: {
    gap: 16,
  },
  categoryItem: {
    gap: 8,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryName: {
    fontWeight: "500",
    fontSize: 14,
    color: "#18181b",
  },
  categoryPercentage: {
    fontSize: 12,
    color: "#71717a",
  },
  categoryAmount: {
    fontWeight: "600",
    color: "#18181b",
  },
  skeletonContainer: {
    gap: 16,
    marginTop: 16,
  },
  skeletonItem: {
    gap: 8,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skeletonRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#e4e4e7",
  },
  skeletonTextLarge: {
    height: 16,
    width: 80,
    backgroundColor: "#e4e4e7",
    borderRadius: 4,
  },
  skeletonTextSmall: {
    height: 12,
    width: 64,
    backgroundColor: "#e4e4e7",
    borderRadius: 4,
    marginTop: 4,
  },
  skeletonAmount: {
    height: 16,
    width: 48,
    backgroundColor: "#e4e4e7",
    borderRadius: 4,
  },
});

export default CategoryTransactions;
