import { showPlatformMessage } from "@/components/alerts/toast-message";
import { useTransactionsQuery } from "@/services/query/transactions.query";
import { TransactionService } from "@/services/transactions.service";
import { TransactionProps } from "@/types/transaction-props";
import { endOfMonth, isWithinInterval, parseISO, startOfMonth } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";

interface UseTransactionsPageProps {
  userId: string;
  initialDate?: Date;
}

interface UseTransactionsPageReturn {
  // State
  selectedDate: Date;
  selectedTransactions: string[];
  isSelecting10: boolean;
  isDeleting: boolean;
  refreshing: boolean;

  // Query Data
  transactions: TransactionProps[] | undefined;
  isLoadingTransactions: boolean;
  transactionsError: Error | null;

  // Filtered Data
  filteredTransactions: TransactionProps[];
  paginatedTransactions: TransactionProps[];

  // Actions
  setSelectedDate: (date: Date) => void;
  handleRefresh: () => Promise<void>;
  handleEdit: (transaction: TransactionProps) => void;
  handleDelete: (id: string) => void;
  handleSelect10Transactions: () => void;
  handleDeleteSelected: () => void;
  handleSelectTransaction: (id: string) => void;
  handleDeleteMultiple: (selectedIds: string[]) => Promise<void>;

  // Utils
  filterTransactionsByMonth: (
    transactions: TransactionProps[],
    date: Date | string
  ) => TransactionProps[];
}

export const useTransactionsPage = ({
  userId,
  initialDate = new Date(),
}: UseTransactionsPageProps): UseTransactionsPageReturn => {
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    []
  );
  const [isSelecting10, setIsSelecting10] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    isLoadingTransactions,
    isRefetchingTransactions,
    refetchTransactions,
    transactions,
    transactionsError,
  } = useTransactionsQuery(userId);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchTransactions();
    setRefreshing(false);
  }, [refetchTransactions]);

  // Filter function
  const filterTransactionsByMonth = useCallback(
    (
      transactionsToFilter: TransactionProps[],
      date: Date | string
    ): TransactionProps[] => {
      const dateObj = typeof date === "string" ? parseISO(date) : date;
      const start = startOfMonth(dateObj);
      const end = endOfMonth(dateObj);

      return transactionsToFilter.filter((transaction) => {
        const transactionDate = parseISO(transaction.date);
        return isWithinInterval(transactionDate, { start, end });
      });
    },
    []
  );

  // Filtered transactions
  const filteredTransactions = transactions
    ? filterTransactionsByMonth(transactions, selectedDate)
    : [];

  const paginatedTransactions = filteredTransactions.slice(0);

  // Auto-update date when month changes
  useEffect(() => {
    const checkMonthChange = () => {
      const now = new Date();
      if (
        now.getMonth() !== selectedDate.getMonth() ||
        now.getFullYear() !== selectedDate.getFullYear()
      ) {
        setSelectedDate(now);
      }
    };

    const interval = setInterval(checkMonthChange, 3600000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  // Selection handlers
  const handleSelect10Transactions = useCallback(() => {
    if (isSelecting10) {
      setSelectedTransactions([]);
      setIsSelecting10(false);
    } else {
      const first10Ids = paginatedTransactions
        .slice(0, 10)
        .map((transaction) => transaction.id);
      setSelectedTransactions(first10Ids);
      setIsSelecting10(true);
    }
  }, [isSelecting10, paginatedTransactions]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedTransactions.length > 0) {
      handleDeleteMultiple(selectedTransactions);
    }
  }, [selectedTransactions]);

  const handleDeleteMultiple = useCallback(
    async (selectedIds: string[]) => {
      setIsDeleting(true);
      try {
        await TransactionService.deleteMultiple(selectedIds);

        if (selectedIds.length === 1) {
          showPlatformMessage("Transação deletada com sucesso!");
        } else {
          showPlatformMessage("Transações deletadas com sucesso!");
        }

        await refetchTransactions();
        setSelectedTransactions([]);
        setIsSelecting10(false);
        setIsDeleting(false);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao deletar transações";

        if (Platform.OS === "android") {
          ToastAndroid.show(
            `Erro ao deletar transações: ${errorMessage}`,
            ToastAndroid.SHORT
          );
        } else {
          Alert.alert(`Erro ao deletar transações: ${errorMessage}`);
        }
        setIsDeleting(false);
      }
    },
    [refetchTransactions]
  );

  const handleSelectTransaction = useCallback((id: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(id)
        ? prev.filter((transactionId) => transactionId !== id)
        : [...prev, id]
    );
    setIsSelecting10(false);
  }, []);

  // Placeholder functions (to be implemented)
  const handleEdit = useCallback((transaction: TransactionProps) => {
    console.log("Edit transaction:", transaction);
  }, []);

  const handleDelete = useCallback((id: string) => {
    console.log("Delete transaction:", id);
  }, []);

  return {
    // State
    selectedDate,
    setSelectedDate,
    selectedTransactions,
    isSelecting10,
    isDeleting,
    refreshing,

    // Query Data
    transactions,
    isLoadingTransactions,
    transactionsError: transactionsError as Error | null,

    // Filtered Data
    filteredTransactions,
    paginatedTransactions,

    // Actions
    handleRefresh,
    handleEdit,
    handleDelete,
    handleSelect10Transactions,
    handleDeleteSelected,
    handleSelectTransaction,
    handleDeleteMultiple,

    // Utils
    filterTransactionsByMonth,
  };
};
