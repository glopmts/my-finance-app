import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { TransactionUpdateProps } from "../services/transactions.service";
import {
  Transaction,
  TransactionPropsCreater,
  TransactionType,
} from "../types/interfaces";

interface UseTransactionFormProps {
  userId: string;
  transactionId?: string;
  transaction?: Transaction;
  mode?: "create" | "edit";
  onSubmit?: (transaction: TransactionPropsCreater) => Promise<void>;
  onUpdate?: (transaction: TransactionUpdateProps) => Promise<void>;
  refetch?: () => void;
}

interface UseTransactionFormReturn {
  type: TransactionType;
  amount: string;
  description: string;
  date: Date;
  isRecurring: boolean;
  categoryId: string | null;
  isLoading: boolean;
  errors: Record<string, string>;
  setType: (type: TransactionType) => void;
  setAmount: (amount: string) => void;
  setDescription: (description: string) => void;
  setDate: (date: Date) => void;
  setIsRecurring: (isRecurring: boolean) => void;
  setCategoryId: (categoryId: string | null) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  handleSubmit: () => Promise<void>;
  formatCurrency: (value: string) => string;
}

export const useTransactionForm = ({
  userId,
  transactionId,
  transaction,
  mode = "create",
  onSubmit,
  onUpdate,
  refetch,
}: UseTransactionFormProps): UseTransactionFormReturn => {
  const [type, setType] = useState<TransactionType>(
    transaction?.type || "EXPENSE"
  );
  const [amount, setAmount] = useState(transaction?.amount.toString() || "");
  const [description, setDescription] = useState(
    transaction?.description || ""
  );
  const [date, setDate] = useState(
    transaction ? new Date(transaction.date) : new Date()
  );
  const [isRecurring, setIsRecurring] = useState(
    transaction?.isRecurring || false
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    transaction?.categoryId || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "O valor deve ser maior que zero";
    }

    if (!amount || isNaN(parseFloat(amount))) {
      newErrors.amount = "Digite um valor válido";
    }

    if (description && description.length > 255) {
      newErrors.description = "A descrição deve ter no máximo 255 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [amount, description]);

  const resetForm = useCallback(() => {
    setType("EXPENSE");
    setAmount("");
    setDescription("");
    setDate(new Date());
    setIsRecurring(false);
    setCategoryId(null);
    setErrors({});
  }, []);

  const formatCurrency = useCallback((value: string): string => {
    const numericValue = value.replace(/[^0-9.,]/g, "");
    const normalizedValue = numericValue.replace(",", ".");
    const parts = normalizedValue.split(".");

    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }

    if (parts[1] && parts[1].length > 2) {
      return parts[0] + "." + parts[1].substring(0, 2);
    }

    return normalizedValue;
  }, []);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const normalizedDescription = description
        ? description.toUpperCase()
        : null;
      const parsedAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;

      if (mode === "edit" && transaction && onUpdate && transactionId) {
        const transactionDataUpdate: TransactionUpdateProps = {
          id: transactionId,
          userId,
          amount: parsedAmount,
          date: date.toISOString(),
          isRecurring,
          type,
          description: normalizedDescription,
          recurringId: isRecurring ? `recurring_${Date.now()}` : null,
        };
        await onUpdate(transactionDataUpdate);
        Alert.alert("Sucesso", "Transação atualizada com sucesso!");
        router.push("/(main)/(home)");
        refetch?.();
      } else {
        const transactionData: TransactionPropsCreater = {
          userId,
          type,
          amount: parsedAmount,
          description: normalizedDescription,
          date: date.toISOString(),
          isRecurring,
          recurringId: isRecurring ? `recurring_${Date.now()}` : null,
        };
        await onSubmit?.(transactionData);
        Alert.alert("Sucesso", "Transação criada com sucesso!");
        router.push("/(main)/(home)");
        resetForm();
        refetch?.();
      }
    } catch (error) {
      const errorMessage =
        mode === "edit"
          ? "Não foi possível atualizar a transação. Tente novamente."
          : "Não foi possível criar a transação. Tente novamente.";

      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      Alert.alert("Erro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    validateForm,
    description,
    amount,
    mode,
    transaction,
    onUpdate,
    transactionId,
    userId,
    date,
    isRecurring,
    type,
    refetch,
    onSubmit,
    resetForm,
  ]);

  return {
    type,
    amount,
    description,
    date,
    isRecurring,
    categoryId,
    isLoading,
    errors,
    setType,
    setAmount,
    setDescription,
    setDate,
    setIsRecurring,
    setCategoryId,
    validateForm,
    resetForm,
    handleSubmit,
    formatCurrency,
  };
};
