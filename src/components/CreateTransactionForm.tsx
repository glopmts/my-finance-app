import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
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
import { TransactionPropsCreater, TransactionType } from "../types/interfaces";
import { createTransactionStyles } from "./styles/creater-transactions";

interface CreateTransactionFormProps {
  userId: string;
  categories?: { id: string; name: string }[];
  onSubmit: (transaction: TransactionPropsCreater) => Promise<void>;
  onCancel?: () => void;
}

const CreateTransactionForm: React.FC<CreateTransactionFormProps> = ({
  userId,
  categories = [],
  onSubmit,
  onCancel,
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const transaction: TransactionPropsCreater = {
        userId,
        type,
        amount: parseFloat(amount),
        description: description || null,
        date: date.toISOString(),
        isRecurring,
        recurringId: isRecurring ? `recurring_${Date.now()}` : null,
      };

      await onSubmit(transaction);

      // Reset form
      setAmount("");
      setDescription("");
      setDate(new Date());
      setIsRecurring(false);
      setCategoryId(null);
      setErrors({});

      Alert.alert("Sucesso", "Transação criada com sucesso!");
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível criar a transação. Tente novamente." + error
      );
      console.log(
        "Não foi possível criar a transação. Tente novamente." + error
      );
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
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }

    return numericValue;
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

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Nova Transação</Text>
          {onCancel && (
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
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
            maxLength={255}
          />
          <Text style={styles.charCount}>{description.length}/255</Text>
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
              onPress={onCancel}
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
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Criar Transação</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateTransactionForm;
