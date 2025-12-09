import { api } from "@/lib/axios";
import { Transaction } from "@/types/transaction-props";
import { useQuery } from "@tanstack/react-query";

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
  isRecurring?: boolean;
  limit?: number;
  page?: number;
}

export function useTransactionsQuery(
  userId: string,
  filters?: TransactionFilters
) {
  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions,
    isRefetching: isRefetchingTransactions,
  } = useQuery<Transaction[]>({
    queryKey: ["transactions", userId, filters],
    queryFn: async () => {
      if (!userId) throw new Error("ID do usuário é obrigatório");

      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `/transaction/${userId}`;
      const response = await api.get(url);

      if (!response) throw new Error("Falha ao buscar as transações");

      return response.data;
    },
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 15,
    enabled: !!userId,
  });

  return {
    transactions,
    isLoadingTransactions,
    transactionsError,
    refetchTransactions,
    isRefetchingTransactions,
  };
}

// Hook para buscar uma transação específica
export function useTransactionQuery(transactionId: string) {
  const {
    data: transaction,
    isLoading: isLoadingTransaction,
    error: transactionError,
    refetch: refetchTransaction,
    isRefetching: isRefetchingTransaction,
  } = useQuery<Transaction>({
    queryKey: ["transaction", transactionId],
    queryFn: async () => {
      if (!transactionId) throw new Error("ID da transação é obrigatório");

      const response = await api.get(
        `/transaction/transactionId/${transactionId}`
      );

      if (!response) throw new Error("Falha ao buscar a transação");

      return response.data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30,
    enabled: !!transactionId,
  });

  return {
    transaction,
    isLoadingTransaction,
    transactionError,
    refetchTransaction,
    isRefetchingTransaction,
  };
}

// Hook para buscar 5 últimas transações
export function use5TransactionsQuery(userId: string) {
  const {
    data: recurringTransactions,
    isLoading: isLoadingRecurring,
    error: recurringError,
    refetch: refetchRecurring,
  } = useQuery<Transaction[]>({
    queryKey: ["transactions", "recurring", userId],
    queryFn: async () => {
      if (!userId) throw new Error("ID do usuário é obrigatório");

      const response = await api.get(`/transaction/latest/user/${userId}`);

      if (!response) throw new Error("Falha ao buscar 5 últimas transações");

      return response.data.data;
    },
    refetchInterval: 120000,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 20,
    enabled: !!userId,
  });

  return {
    recurringTransactions,
    isLoadingRecurring,
    recurringError,
    refetchRecurring,
  };
}

export function useTransactionsSummaryQuery(
  userId: string,
  period?: { startDate?: string; endDate?: string }
) {
  const {
    data: transactionsSummary,
    isLoading: isLoadingSummary,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["transactions", "summary", userId, period],
    queryFn: async () => {
      if (!userId) throw new Error("ID do usuário é obrigatório");

      const queryParams = new URLSearchParams();
      if (period?.startDate) queryParams.append("startDate", period.startDate);
      if (period?.endDate) queryParams.append("endDate", period.endDate);

      const url = `/transaction/${userId}/summary${
        queryParams.toString() ? `?${queryParams}` : ""
      }`;
      const response = await api.get(url);

      if (!response) throw new Error("Falha ao buscar resumo das transações");

      return response.data;
    },
    refetchInterval: 300000, // 5 minutos
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: !!userId,
  });

  return {
    transactionsSummary,
    isLoadingSummary,
    summaryError,
    refetchSummary,
  };
}

export default function GetTransactionsQuery(
  userId: string,
  options?: {
    filters?: TransactionFilters;
    includeSingle?: string;
    includeRecurring?: boolean;
    includeSummary?: boolean;
  }
) {
  const {
    transactions: mockTransaction,
    isLoadingTransactions: loader,
    transactionsError: errorTransaction,
    refetchTransactions: refetchTransaction,
  } = useTransactionsQuery(userId, options?.filters);

  const singleTransaction = useTransactionQuery(options?.includeSingle || "");

  const recurringTransactions = use5TransactionsQuery(
    options?.includeRecurring ? userId : ""
  );

  const summary = useTransactionsSummaryQuery(
    options?.includeSummary ? userId : ""
  );

  return {
    mockTransaction,
    loader,
    errorTransaction,
    refetchTransaction,

    // Novas funcionalidades
    singleTransaction: singleTransaction.transaction,
    isLoadingSingle: singleTransaction.isLoadingTransaction,
    singleError: singleTransaction.transactionError,
    refetchSingle: singleTransaction.refetchTransaction,

    recurringTransactions: recurringTransactions.recurringTransactions,
    isLoadingRecurring: recurringTransactions.isLoadingRecurring,
    recurringError: recurringTransactions.recurringError,
    refetchRecurring: recurringTransactions.refetchRecurring,

    summary: summary.transactionsSummary,
    isLoadingSummary: summary.isLoadingSummary,
    summaryError: summary.summaryError,
    refetchSummary: summary.refetchSummary,
  };
}
