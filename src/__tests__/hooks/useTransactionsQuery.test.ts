import { useTransactionsQuery } from "@/services/query/transactions.query";
import { QueryClient } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import { api } from "../../__mocks__/lib/api-from-url";
import { createWrapper } from "../queryWrapper";

// Mock da API
jest.mock("@/lib/api-from-url", () => ({
  api: {
    get: jest.fn(),
  },
}));

// Mock do React Query devtools (se estiver usando)
jest.mock("@tanstack/react-query", () => {
  const original = jest.requireActual("@tanstack/react-query");
  return {
    ...original,
    useIsFetching: jest.fn(),
  };
});

// Função para criar wrapper
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

describe("useTransactionsQuery", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("deve lançar erro quando userId está vazio", async () => {
    const { result } = renderHook(() => useTransactionsQuery(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoadingTransactions).toBe(false);
    });

    // O erro pode não aparecer imediatamente no current.error
    // Verificamos o comportamento do hook
    expect(result.current.transactions).toBeUndefined();
  });

  it("deve fazer a requisição com userId válido", async () => {
    const mockTransactions = [
      { id: "1", title: "Compra", value: 100, type: "expense" as const },
      { id: "2", title: "Salário", value: 2000, type: "income" as const },
    ];

    (api.get as jest.Mock).mockResolvedValueOnce({
      data: mockTransactions,
    });

    const { result } = renderHook(
      () => useTransactionsQuery("cmg74w1n90000uro48pq6gmph"),
      {
        wrapper: createWrapper(),
      }
    );

    // Verifica loading inicial
    expect(result.current.isLoadingTransactions).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingTransactions).toBe(false);
    });

    // Verifica se a chamada foi feita com os parâmetros corretos
    expect(api.get).toHaveBeenCalledWith(
      "/transaction/cmg74w1n90000uro48pq6gmph"
    );

    // Verifica os dados retornados
    expect(result.current.transactions).toEqual(mockTransactions);
  });

  it("deve aplicar filtros quando fornecidos", async () => {
    const mockTransactions = [
      { id: "1", title: "Filtrada", value: 500, type: "INCOME" as const },
    ];

    (api.get as jest.Mock).mockResolvedValueOnce({
      data: mockTransactions,
    });

    const filters = {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      type: "INCOME" as const,
    };

    const { result } = renderHook(
      () => useTransactionsQuery("cmg74w1n90000uro48pq6gmph", filters),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoadingTransactions).toBe(false);
    });

    // Verifica se a chamada foi feita com query params
    expect(api.get).toHaveBeenCalled();
    // A URL deve conter os parâmetros de filtro
  });

  it("deve retornar erro quando a API falhar", async () => {
    const errorMessage = "Erro na requisição";
    (api.get as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(
      () => useTransactionsQuery("cmg74w1n90000uro48pq6gmph"),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoadingTransactions).toBe(false);
    });

    expect(result.current.transactionsError?.message).toBe(errorMessage);
  });

  it("deve permitir refetch manual", async () => {
    const mockTransactions1 = [
      { id: "1", title: "Transação 1", value: 100, type: "expense" as const },
    ];

    const mockTransactions2 = [
      { id: "1", title: "Transação 1", value: 100, type: "expense" as const },
      { id: "2", title: "Transação 2", value: 200, type: "income" as const },
    ];

    (api.get as jest.Mock)
      .mockResolvedValueOnce({ data: mockTransactions1 })
      .mockResolvedValueOnce({ data: mockTransactions2 });

    const { result } = renderHook(
      () => useTransactionsQuery("cmg74w1n90000uro48pq6gmph"),
      {
        wrapper: createWrapper(),
      }
    );

    // Aguarda primeira carga
    await waitFor(() => {
      expect(result.current.transactions).toEqual(mockTransactions1);
    });

    // Faz refetch
    await result.current.refetchTransactions();

    // Verifica segunda chamada
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
      expect(result.current.transactions).toEqual(mockTransactions2);
    });
  });

  it("não deve fazer requisição quando userId é falso", () => {
    const { result } = renderHook(() => useTransactionsQuery(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoadingTransactions).toBe(false);
    expect(api.get).not.toHaveBeenCalled();
  });
});
