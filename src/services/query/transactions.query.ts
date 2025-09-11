import { api } from "@/lib/axios";
import { Transaction } from "@/types/interfaces";
import { useQuery } from "@tanstack/react-query";

export default function GetTransactionsQuery(userId: string) {
  const {
    data: mockTransaction,
    isLoading: loader,
    error: errorTransaction,
    refetch: refetchTransaction,
  } = useQuery<Transaction[]>({
    queryKey: ["transactions", userId],
    queryFn: async () => {
      if (!userId) throw new Error("ID do usuário inválido");

      const response = await api.get(`/transaction/${userId}`);
      if (!response) throw new Error("Falha ao buscar as tarefas");

      return response.data;
    },
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 15,
    enabled: !!userId,
  });

  return {
    mockTransaction,
    loader: loader,
    errorTransaction: errorTransaction,
    refetchTransaction: refetchTransaction,
  };
}
