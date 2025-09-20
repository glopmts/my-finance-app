import { api } from "../lib/axios";
import {
  ApiResponse,
  TransactionPropsCreater,
  TransactionType,
} from "../types/interfaces";

export interface Transaction extends TransactionPropsCreater {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionUpdateProps {
  id: string;
  userId: string;
  description?: string | null;
  type?: TransactionType;
  amount?: number;
  date?: string;
  isRecurring?: boolean;
  recurringId?: string | null;
  categoryId?: string | null;
}

export interface TransactionFilters {
  userId?: string;
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  isRecurring?: boolean;
  page?: number;
  limit?: number;
}

export interface TransactionResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Classe de Serviço
export class TransactionService {
  /**
   * Criar uma nova transação
   */
  static async create(
    transactionData: TransactionPropsCreater
  ): Promise<Transaction> {
    try {
      const cleanedData = {
        ...transactionData,
        description: transactionData.description || null,
        recurringId: transactionData.recurringId || null,
      };

      const response = await api.post<Transaction>(
        "/transaction/creater",
        cleanedData
      );
      return response.data;
    } catch (error: any) {
      console.error("Erro detalhado ao criar transação:", error.response?.data);
      throw new Error(error.response?.data?.error || "Erro ao criar transação");
    }
  }

  /**
   * Buscar transação por ID
   */
  static async getById(id: string): Promise<Transaction> {
    try {
      const response = await api.get<Transaction>(`/transaction/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar transação:", error);
      throw error;
    }
  }

  /**
   * Listar todas as transações com filtros opcionais
   */
  static async getAll(
    filters?: TransactionFilters
  ): Promise<TransactionResponse> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get<TransactionResponse>(
        `/transaction?${params}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao listar transações:", error);
      throw error;
    }
  }

  static async getTransactionLimit({
    userId,
  }: {
    userId: string;
  }): Promise<TransactionResponse> {
    try {
      const response = await api.get<TransactionResponse>(
        `/transaction/latest/${userId}?limit=${5}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao listar transações:", error);
      throw error;
    }
  }

  /**
   * Buscar transações por usuário
   */
  static async getByUserId(
    userId: string,
    filters?: Omit<TransactionFilters, "userId">
  ): Promise<TransactionResponse> {
    try {
      const allFilters = { ...filters, userId };
      return await this.getAll(allFilters);
    } catch (error) {
      console.error("Erro ao buscar transações do usuário:", error);
      throw error;
    }
  }

  /**
   * Atualizar transação
   */
  static async update(
    updateData: TransactionUpdateProps
  ): Promise<Transaction> {
    try {
      const response = await api.put<Transaction>(
        `/transaction/data/update`,
        updateData
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
  /**
   * Atualização parcial da transação (PATCH)
   */
  static async partialUpdate(
    id: string,
    updateData: Partial<TransactionUpdateProps>
  ): Promise<Transaction> {
    try {
      const response = await api.patch<Transaction>(
        `/transaction/${id}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar parcialmente transação:", error);
      throw error;
    }
  }

  /**
   * Excluir transação
   */
  static async delete(transactionId: string, userId: string): Promise<void> {
    try {
      await api.delete(`/transaction/delete/${transactionId}/${userId}`);
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      throw error;
    }
  }

  /**
   * Excluir múltiplas transações
   */
  static async deleteMultiple(ids: string[]): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<ApiResponse<void>>(
        "/transaction/batch",
        {
          data: { ids },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao excluir transações em lote:", error);
      throw error;
    }
  }

  /**
   * Buscar transações recorrentes
   */
  static async getRecurring(userId?: string): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams();
      params.append("isRecurring", "true");
      if (userId) {
        params.append("userId", userId);
      }

      const response = await api.get<TransactionResponse>(
        `/transaction?${params}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Erro ao buscar transações recorrentes:", error);
      throw error;
    }
  }

  /**
   * Obter resumo financeiro
   */
  static async getSummary(
    userId: string,
    startDate?: string,
    endDate?: string
  ) {
    try {
      const params = new URLSearchParams();
      params.append("userId", userId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await api.get(`/transaction/summary?${params}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao obter resumo financeiro:", error);
      throw error;
    }
  }
}

export const transactionService = {
  create: TransactionService.create,
  getById: TransactionService.getById,
  getAll: TransactionService.getAll,
  getByUserId: TransactionService.getByUserId,
  update: TransactionService.update,
  partialUpdate: TransactionService.partialUpdate,
  delete: TransactionService.delete,
  deleteMultiple: TransactionService.deleteMultiple,
  getRecurring: TransactionService.getRecurring,
  getSummary: TransactionService.getSummary,
};

export default TransactionService;
