import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Text, useColorScheme, View } from "react-native";
import { formatCurrency, formatDate } from "../../lib/formatDts";
import { Salary } from "../../types/interfaces";
import { Transaction } from "../../types/transaction-props";

interface SalaryCardProps {
  salary: Salary;
  progressValue?: number;
  isOverLimit?: boolean;
  transactions?: Transaction[];
  isLoading?: boolean;
  userId: string;
}

export const getFrequencyLabel = (frequency: string) => {
  const labels = {
    MONTHLY: "Mensal",
    WEEKLY: "Semanal",
    YEARLY: "Anual",
    DAILY: "Diário",
  };
  return labels[frequency as keyof typeof labels] || frequency;
};

const SalaryCard = ({ salary }: SalaryCardProps) => {
  const deviceColorScheme = useColorScheme();
  const isDark = deviceColorScheme === "dark";

  return (
    <View className="relative bg-white dark:bg-zinc-800 ring-1 ring-zinc-100 dark:ring-zinc-900 transition-all duration-200 rounded-3xl hover:shadow-md hover:ring-zinc-200 dark:hover:ring-zinc-800">
      <View className="p-6">
        {/* Header Section */}
        <View className="flex-row items-start justify-between mb-6">
          <View className="flex-row items-center gap-3">
            <View
              className="flex-row p-4 h-auto items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700 ring-1 ring-zinc-200 dark:ring-zinc-800"
              style={{
                borderColor: isDark ? "#3f3f46" : "",
                borderWidth: 1,
              }}
            >
              <FontAwesome
                name="dollar"
                size={21}
                color={deviceColorScheme === "dark" ? "#fff" : "#27272a"}
                className="w-6 text-center h-6 "
              />
            </View>
            <View className="space-y-1">
              <Text className="font-medium text-zinc-900 dark:text-white">
                {salary.description || "Salário"}
              </Text>
              <Text className="text-xs text-zinc-500 dark:text-zinc-500 font-mono">
                {salary.id.slice(0, 8)}
              </Text>
            </View>
          </View>

          {salary.isRecurring && (
            <View className="px-2 rounded-md  border-0 bg-zinc-100 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-400 text-xs font-normal">
              <Text className="dark:text-white p-1 flex-row gap-2">
                {" "}
                <Feather name="repeat" size={16} className="mr-3" />
                {getFrequencyLabel(salary.frequency)}
              </Text>
            </View>
          )}
        </View>

        {/* Amount Section */}
        <View
          className="mb-6"
          style={{
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Text className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-1">
            {formatCurrency(salary.amount)}
          </Text>
          <View className="dark:bg-zinc-700/30 bg-zinc-300/30 w-full h-1" />
          <View className="flex-row items-center gap-1 text-xs">
            <Text className=" text-zinc-500 dark:text-white">
              Valor base mensal
            </Text>
          </View>
        </View>

        {/* Progress Section - Replaced ProgressBarAndroid with custom progress bar */}
        {/* <View className="mb-6 space-y-3">
          <ProgressSpending
            maxValue={salary.amount}
            key={salary.id}
            userId={userId}
          />
        </View> */}

        {/* Footer Section */}
        <View className="flex-row items-baseline justify-between pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <View className="flex-row items-center gap-2">
            <AntDesign
              name="calendar"
              size={16}
              color={deviceColorScheme === "dark" ? "#fff" : "#27272a"}
            />
            <Text className="dark:text-white text-base">
              Pagamento: {formatDate(salary.paymentDate)}
            </Text>
          </View>
          <View className="text-right text-xs text-zinc-400 dark:text-zinc-500">
            <Text className="dark:text-white">Atualizado</Text>
            <Text className="font-mono dark:text-white">
              {formatDate(salary.updatedAt)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SalaryCard;
