import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { TransactionUpdateProps } from "../services/transactions.service";
import {
  Transaction,
  TransactionPropsCreater,
  TransactionType,
} from "../types/interfaces";
import { createTransactionStyles } from "./styles/form-transactions";

interface TransactionFormProps {
  userId: string;
  transactionId?: string;
  categories?: { id: string; name: string }[];
  transaction?: Transaction;
  mode?: "create" | "edit";
  onSubmit?: (transaction: TransactionPropsCreater) => Promise<void>;
  onUpdate?: (transaction: TransactionUpdateProps) => Promise<void>;
  onCancel?: () => void;
  refetch?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  userId,
  transactionId,
  categories = [],
  transaction,
  mode = "create",
  onSubmit,
  onUpdate,
  onCancel,
  refetch,
}) => {
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const deviceColorScheme = useColorScheme();

  // Get dynamic styles based on color scheme
  const styles = createTransactionStyles(deviceColorScheme);

  // Preencher dados quando em modo de edição
  useEffect(() => {
    if (mode === "edit" && transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setDescription(transaction.description || "");
      setDate(new Date(transaction.date));
      setIsRecurring(transaction.isRecurring || false);
      setCategoryId(transaction.categoryId || null);
    }
  }, [mode, transaction]);

  const validateForm = (): boolean => {
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
  };

  const resetForm = () => {
    setType("EXPENSE");
    setAmount("");
    setDescription("");
    setDate(new Date());
    setIsRecurring(false);
    setCategoryId(null);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const normalizedDescription = description
        ? description.toUpperCase()
        : null;

      if (mode === "edit" && transaction && onUpdate && transactionId) {
        const transactionDataUpdate: TransactionUpdateProps = {
          id: transactionId,
          userId,
          amount: parseFloat(amount),
          date: date.toISOString(),
          isRecurring,
          type,
          description: normalizedDescription,
          recurringId: isRecurring ? `recurring_${Date.now()}` : null,
        };
        await onUpdate(transactionDataUpdate);
        Alert.alert("Sucesso", "Transação atualizada com sucesso!");
        await refetch?.();
      } else {
        const transactionData: TransactionPropsCreater = {
          userId,
          type,
          amount: parseFloat(amount),
          description: normalizedDescription,
          date: date.toISOString(),
          isRecurring,
          recurringId: isRecurring ? `recurring_${Date.now()}` : null,
        };
        await onSubmit?.(transactionData);
        Alert.alert("Sucesso", "Transação criada com sucesso!");
        router.reload();
        resetForm();
        await refetch?.();
      }
    } catch (error) {
      console.error("Transaction error:", error);
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
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatCurrency = (value: string) => {
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
  };

  const getTypeIcon = (transactionType: TransactionType) => {
    switch (transactionType) {
      case "INCOME":
        return "trending-up";
      case "EXPENSE":
        return "trending-down";
      case "TRANSFER":
        return "swap-horizontal";
    }
  };

  const getTypeColor = (transactionType: TransactionType) => {
    switch (transactionType) {
      case "INCOME":
        return "#10b981";
      case "EXPENSE":
        return "#ef4444";
      case "TRANSFER":
        return "#3b82f6";
    }
  };

  const getIconColor = () => {
    return deviceColorScheme === "dark" ? "#71717a" : "#6b7280";
  };

  const getTitle = () => {
    return mode === "edit" ? "Editar Transação" : "Nova Transação";
  };

  const getSubmitButtonText = () => {
    return mode === "edit" ? "Salvar Alterações" : "Criar Transação";
  };

  const getSubmitIcon = () => {
    return mode === "edit" ? "save-outline" : "checkmark";
  };

  const handleCancel = () => {
    if (mode === "create") {
      // Confirmar se há dados não salvos
      const hasUnsavedData = amount || description || isRecurring || categoryId;

      if (hasUnsavedData) {
        Alert.alert(
          "Descartar alterações?",
          "Você tem dados não salvos. Tem certeza que deseja sair?",
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "Descartar",
              style: "destructive",
              onPress: () => {
                resetForm();
                onCancel?.();
              },
            },
          ]
        );
      } else {
        onCancel?.();
      }
    } else {
      // Para modo de edição, apenas volta sem salvar
      onCancel?.();
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>{getTitle()}</Text>
          {onCancel && (
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={getIconColor()} />
            </TouchableOpacity>
          )}
        </View>

        {/* Transaction Type Selector */}
        <View style={styles.typeContainer}>
          {(["INCOME", "EXPENSE", "TRANSFER"] as TransactionType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeButton,
                type === t && { backgroundColor: getTypeColor(t) },
              ]}
              onPress={() => setType(t)}
            >
              <Ionicons
                name={getTypeIcon(t) as any}
                size={20}
                color={type === t ? "#fff" : getIconColor()}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  type === t && styles.typeButtonTextActive,
                ]}
              >
                {t === "INCOME"
                  ? "Receita"
                  : t === "EXPENSE"
                    ? "Despesa"
                    : "Transferência"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor *</Text>
          <View
            style={[
              styles.amountInputContainer,
              errors.amount && styles.inputError,
            ]}
          >
            <Text style={styles.currencySymbol}>R$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => setAmount(formatCurrency(text))}
              placeholder="0,00"
              keyboardType="decimal-pad"
              placeholderTextColor={
                deviceColorScheme === "dark" ? "#71717a" : "#9ca3af"
              }
              returnKeyType="next"
            />
          </View>
          {errors.amount && (
            <Text style={styles.errorText}>{errors.amount}</Text>
          )}
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              errors.description && styles.inputError,
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Digite uma descrição (opcional)"
            placeholderTextColor={
              deviceColorScheme === "dark" ? "#71717a" : "#9ca3af"
            }
            multiline
            numberOfLines={3}
            maxLength={20}
            returnKeyType="done"
            blurOnSubmit={true}
          />
          <View style={styles.charCountContainer}>
            <Text style={styles.charCount}>{description.length}/20</Text>
          </View>
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
        </View>

        {/* Date Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={getIconColor()}
            />
            <Text style={styles.dateButtonText}>
              {date.toLocaleDateString("pt-BR")}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Category Picker */}
        {categories.length > 0 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={categoryId}
                onValueChange={(itemValue) => setCategoryId(itemValue)}
                style={styles.picker}
                itemStyle={
                  deviceColorScheme === "dark"
                    ? { color: "#fff" }
                    : { color: "#000" }
                }
              >
                <Picker.Item label="Selecione uma categoria" value={null} />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={category.id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {/* Recurring Switch */}
        <View style={styles.switchContainer}>
          <View style={styles.switchLabelContainer}>
            <Ionicons name="repeat" size={20} color={getIconColor()} />
            <Text style={styles.switchLabel}>Transação Recorrente</Text>
          </View>
          <Switch
            value={isRecurring}
            onValueChange={setIsRecurring}
            trackColor={{
              false: deviceColorScheme === "dark" ? "#3f3f46" : "#d1d5db",
              true: "#86efac",
            }}
            thumbColor={
              isRecurring
                ? "#10b981"
                : deviceColorScheme === "dark"
                  ? "#71717a"
                  : "#f3f4f6"
            }
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {onCancel && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              { backgroundColor: getTypeColor(type) },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons
                  name={getSubmitIcon() as any}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.submitButtonText}>
                  {getSubmitButtonText()}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Show additional info for edit mode */}
        {mode === "edit" && transaction && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Criado em:{" "}
              {new Date(
                transaction.createdAt || transaction.date
              ).toLocaleDateString("pt-BR")}
            </Text>
            {transaction.updatedAt && (
              <Text style={styles.infoText}>
                Última atualização:{" "}
                {new Date(transaction.updatedAt).toLocaleDateString("pt-BR")}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TransactionForm;
