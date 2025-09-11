import { api } from "@/lib/axios";
import { Salary } from "@/types/interfaces";
import { useQuery } from "@tanstack/react-query";

export default function GetSalaryQuery(userId: string) {
  const {
    data: salary,
    error,
    isLoading,
    refetch,
  } = useQuery<Salary[]>({
    queryKey: ["salary", userId],
    queryFn: async () => {
      if (!userId) throw new Error("ID do usuário inválido");

      const response = await api.get(`/salary/${userId}`);
      if (!response) throw new Error("Falha ao buscar as tarefas");

      return response.data;
    },
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 15,
    enabled: !!userId,
  });

  return {
    salary,
    isLoading,
    error,
    refetch,
  };
}
