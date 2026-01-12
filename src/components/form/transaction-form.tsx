import { EvilIcons, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
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
import { useTransactionForm } from "../../hooks/useTransactionForm";
import { createTransactionStyles } from "../../styles/form-transactions";
import {
  Transaction,
  TransactionPropsCreater,
  TransactionType,
  TransactionUpdateProps,
} from "../../types/transaction-props";
import CategorySelector from "./categorys-selector";
import PaymentSourceSelector from "./payment-source-selector";

interface TransactionFormProps {
  userId: string;
  transactionId?: string;
  categories?: { id: string; name: string }[];
  transaction?: Transaction;
  mode?: "create" | "edit";
  onSubmit?: (transaction: TransactionPropsCreater) => Promise<void>;
  onUpdate?: (transaction: TransactionUpdateProps) => Promise<void>;
  onCancel?: () => void;
  handleDelete?: (transactionId: string) => void;
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
  handleDelete,
}) => {
  const deviceColorScheme = useColorScheme();
  const styles = createTransactionStyles(deviceColorScheme);

  const {
    type,
    amount,
    description,
    date,
    isRecurring,
    isLoading,
    errors,
    setType,
    setAmount,
    setDescription,
    setDate,
    setIsRecurring,
    resetForm,
    handleSubmit,
    formatCurrency,
    category,
    paymentSource,
    setCategory,
    setPaymentSource,
  } = useTransactionForm({
    userId,
    transactionId,
    transaction,
    mode,
    onSubmit,
    onUpdate,
    refetch,
  });

  useEffect(() => {
    if (mode === "edit" && transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setDescription(transaction.description || "");
      setDate(new Date(transaction.date));
      setIsRecurring(transaction.isRecurring || false);
    }
  }, [
    mode,
    transaction,
    setType,
    setAmount,
    setDescription,
    setDate,
    setIsRecurring,
  ]);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
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
      const hasUnsavedData = amount || description || isRecurring;
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
          {mode === "edit" && onCancel && (
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons
                name="arrow-back-circle-outline"
                size={28}
                color={getIconColor()}
              />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{getTitle()}</Text>
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

        {/* category select */}
        <View>
          <Text style={styles.title} className="mb-4">
            Selecione uma categroia:
          </Text>

          <CategorySelector
            onCategoryChange={setCategory}
            selectedCategory={category}
          />
        </View>

        {/* paymentSource types */}

        <PaymentSourceSelector
          onSourceChange={setPaymentSource}
          selectedSource={paymentSource}
        />

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
        <View className="flex flex-col gap-4">
          <View className="flex-row gap-4">
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
          {mode === "edit" && (
            <TouchableOpacity
              onPress={() => handleDelete && handleDelete(transaction?.id!)}
              style={[styles.button]}
              className="bg-red-500"
            >
              <EvilIcons name="trash" color="#fff" size={26} />
              <Text style={styles.submitButtonText}>Deletar</Text>
            </TouchableOpacity>
          )}
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
