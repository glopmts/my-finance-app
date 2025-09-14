import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/axios";

type User = {
  id: string;
  name: string | null;
  email: string;
  clerkId: string;
  image: string | null;
  createdAt: Date | string;
};

export function useUserQuery(userId: string) {
  const {
    data: userData,
    isLoading: isLoadingRecurring,
    error: recurringError,
    refetch: refetchRecurring,
  } = useQuery<User>({
    queryKey: ["user", "recurring", userId],
    queryFn: async () => {
      if (!userId) throw new Error("ID do usuário é obrigatório");

      const response = await api.get(`/auth/user/${userId}`);

      if (!response) throw new Error("Falha ao buscar Usúario");

      return response.data.data;
    },
    refetchInterval: 120000, // 2 minutos
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 20, // 20 minutos
    enabled: !!userId,
  });

  return {
    userData,
    isLoadingRecurring,
    recurringError,
    refetchRecurring,
  };
}
