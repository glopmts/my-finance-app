import { Frequency, Salary } from "@/types/interfaces";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

interface CreateSalaryProps {
  salary?: Salary;
  userId: string;
  onSubmit: (salary: Omit<Salary, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  onBack?: () => void;
}

const FormAutouSalaryUser: React.FC<CreateSalaryProps> = ({
  salary,
  userId,
  onSubmit,
  onCancel,
  onBack,
}) => {
  const systemColorScheme = useColorScheme();

  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [frequency, setFrequency] = useState<Frequency>(Frequency.MONTHLY);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!salary;

  useEffect(() => {
    if (salary) {
      setAmount(salary.amount.toString());
      setDescription(salary.description || "");
      setPaymentDate(new Date(salary.paymentDate));
      setFrequency(salary.frequency);
      setIsRecurring(salary.isRecurring);
    }
  }, [salary]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Valor deve ser maior que zero";
    }

    if (isNaN(parseFloat(amount))) {
      newErrors.amount = "Valor deve ser um número válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert("Erro", "Por favor, corrija os erros no formulário");
      return;
    }

    const salaryData: Omit<Salary, "id" | "createdAt" | "updatedAt"> = {
      userId,
      amount: parseFloat(amount),
      description: description.trim() || null,
      paymentDate: paymentDate.toISOString(),
      frequency,
      isRecurring,
    };

    onSubmit(salaryData);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || paymentDate;
    setShowDatePicker(Platform.OS === "ios");
    setPaymentDate(currentDate);
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9.,]/g, "");
    return numericValue;
  };

  const frequencyOptions = [
    { label: "Semanal", value: Frequency.WEEKLY },
    { label: "Quinzenal", value: Frequency.BIWEEKLY },
    { label: "Mensal", value: Frequency.MONTHLY },
    { label: "Anual", value: Frequency.YEARLY },
  ];

  const currentStyles = systemColorScheme ? darkStyles : lightStyles;

  return (
    <ScrollView style={[styles.container, currentStyles.container]}>
      <View style={[styles.header, currentStyles.header]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons
              name="arrow-back"
              size={26}
              style={[styles.backButtonText, currentStyles.headerText]}
            />
          </TouchableOpacity>
          <Text style={[styles.title, currentStyles.headerText]}>
            {isEditing ? "Editar Salário" : "Novo Salário"}
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        {/* Campo Valor */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, currentStyles.label]}>Valor *</Text>
          <TextInput
            style={[
              styles.input,
              currentStyles.input,
              errors.amount ? styles.inputError : null,
            ]}
            value={amount}
            onChangeText={(text) => setAmount(formatCurrency(text))}
            keyboardType="numeric"
            placeholder="0,00"
            placeholderTextColor={currentStyles ? "#666" : "#999"}
          />
          {errors.amount && (
            <Text style={styles.errorText}>{errors.amount}</Text>
          )}
        </View>

        {/* Campo Descrição */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, currentStyles.label]}>Descrição</Text>
          <TextInput
            style={[styles.input, currentStyles.input]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descrição do salário (opcional)"
            placeholderTextColor={currentStyles ? "#666" : "#999"}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Campo Data de Pagamento */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, currentStyles.label]}>
            Data de Pagamento *
          </Text>
          <TouchableOpacity
            style={[styles.dateButton, currentStyles.input]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateButtonText, currentStyles.inputText]}>
              {paymentDate.toLocaleDateString("pt-BR")}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={paymentDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Campo Frequência */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, currentStyles.label]}>Frequência *</Text>
          <View style={styles.frequencyContainer}>
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyButton,
                  currentStyles.frequencyButton,
                  frequency === option.value
                    ? currentStyles.frequencyButtonActive
                    : null,
                ]}
                onPress={() => setFrequency(option.value)}
              >
                <Text
                  style={[
                    styles.frequencyButtonText,
                    currentStyles.frequencyButtonText,
                    frequency === option.value
                      ? currentStyles.frequencyButtonTextActive
                      : null,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Campo Recorrente */}
        <View style={styles.inputGroup}>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                currentStyles.checkbox,
                isRecurring ? currentStyles.checkboxActive : null,
              ]}
              onPress={() => setIsRecurring(!isRecurring)}
            >
              {isRecurring && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={[styles.checkboxLabel, currentStyles.label]}>
              Salário recorrente
            </Text>
          </View>
        </View>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.cancelButton, currentStyles.cancelButton]}
            onPress={onCancel}
          >
            <Text
              style={[styles.cancelButtonText, currentStyles.cancelButtonText]}
            >
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {isEditing ? "Atualizar" : "Criar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  themeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  themeButtonText: {
    fontSize: 20,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#f44336",
  },
  errorText: {
    color: "#f44336",
    fontSize: 12,
    marginTop: 4,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
  },
  frequencyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  frequencyButtonText: {
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 26,
    backgroundColor: "#4CAF50",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});

// Light theme styles
const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2196F3",
  },
  headerText: {
    color: "#fff",
  },
  label: {
    color: "#333",
  },
  input: {
    borderColor: "#ddd",
    backgroundColor: "#fff",
    color: "#333",
  },
  inputText: {
    color: "#333",
  },
  frequencyButton: {
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  frequencyButtonActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  frequencyButtonText: {
    color: "#666",
  },
  frequencyButtonTextActive: {
    color: "#fff",
  },
  checkbox: {
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  checkboxActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  cancelButton: {
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  cancelButtonText: {
    color: "#666",
  },
});

// Dark theme styles
const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
  },
  header: {
    backgroundColor: "#1e1e1e",
  },
  headerText: {
    color: "#fff",
  },
  label: {
    color: "#e0e0e0",
  },
  input: {
    borderColor: "#444",
    backgroundColor: "#2a2a2a",
    color: "#e0e0e0",
  },
  inputText: {
    color: "#e0e0e0",
  },
  frequencyButton: {
    borderColor: "#444",
    backgroundColor: "#2a2a2a",
  },
  frequencyButtonActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  frequencyButtonText: {
    color: "#b0b0b0",
  },
  frequencyButtonTextActive: {
    color: "#fff",
  },
  checkbox: {
    borderColor: "#444",
    backgroundColor: "#2a2a2a",
  },
  checkboxActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  cancelButton: {
    borderColor: "#444",
    backgroundColor: "#2a2a2a",
  },
  cancelButtonText: {
    color: "#b0b0b0",
  },
});

export default FormAutouSalaryUser;
