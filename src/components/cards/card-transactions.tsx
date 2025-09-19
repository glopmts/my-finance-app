import { formatCurrency, formatDate } from "@/lib/formatDts";
import type { TransactionProps } from "@/types/interfaces";
import { AntDesign, Entypo, Feather } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { forwardRef } from "react";
import {
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

type DataProps = {
  transaction?: TransactionProps;
  userId: string | null;
  refetch: () => void;
  handleDelete?: (id: string) => void;
  handleFixed?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  handleEdite: (transaction: TransactionProps) => void;
};

// Criar um TouchableOpacity customizado com forwardRef
const CustomTouchableOpacity = forwardRef<any, TouchableOpacityProps>(
  ({ children, ...props }, ref) => {
    return (
      <TouchableOpacity ref={ref} {...props}>
        {children}
      </TouchableOpacity>
    );
  }
);

CustomTouchableOpacity.displayName = "CustomTouchableOpacity";

const CardTransaction = ({
  transaction,
  userId,
  refetch,
  handleDelete,
  handleEdite,
  isSelected,
  onSelect,
}: DataProps) => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleCheckboxClick = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onSelect?.();
  };

  const handleCardClick = (e: GestureResponderEvent) => {
    if (!(e.target instanceof HTMLElement)) return;

    const interactiveElements = ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"];
    if (!interactiveElements.includes(e.target.tagName)) {
      onSelect?.();
    }
  };

  if (!transaction) {
    return (
      <View className="border-zinc-200/50 bg-zinc-50/30 dark:border-zinc-800/50 dark:bg-zinc-900/30 p-4 rounded-lg">
        <View className="flex flex-col items-center justify-center gap-4">
          <Text className="text-center text-zinc-500 dark:text-zinc-400">
            Nenhuma transação disponível
          </Text>
          {userId && (
            <CustomTouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg">
              <Link href="/">
                <Text className="text-white font-semibold">
                  Criar transação
                </Text>
              </Link>
            </CustomTouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const handleTransaction = (id: string) => {
    router.navigate({
      pathname: "/edite-transaction/[id]",
      params: { id: id },
    });
  };

  const getTypeLabel = (frequency: string) => {
    const labels = {
      INCOME: "RECEITA",
      EXPENSE: "DESPESA",
      TRANSFER: "TRANSFERIR",
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      INCOME: "text-green-600 dark:text-green-400",
      EXPENSE: "text-red-600 dark:text-red-400",
      TRANSFER: "text-blue-600 dark:text-blue-400",
    };
    return (
      colors[type as keyof typeof colors] || "text-zinc-600 dark:text-zinc-400"
    );
  };

  return (
    <View
      className={`
      relative overflow-hidden border-zinc-200/50 bg-zinc-50/30 
      backdrop-blur-sm transition-all duration-200 hover:border-zinc-300/60 
      hover:bg-zinc-50/50 hover:shadow-sm dark:border-zinc-800/50 
      dark:bg-zinc-950 dark:hover:border-zinc-700/60
      rounded-3xl mb-3 border
    `}
    >
      <CustomTouchableOpacity
        onLongPress={() => handleTransaction(transaction.id)}
        onPress={handleCardClick}
        activeOpacity={0.9}
        className={`
          ${isSelected ? "border-blue-500 border-2" : ""}
        `}
      >
        <View className="absolute inset-0 bg-gradient-to-br from-zinc-50/20 to-transparent dark:from-zinc-800/20" />

        <View className="relative p-4 w-full">
          <View className="absolute -top-5 p-2 right-0">
            {/* Menu dropdown será implementado aqui */}
          </View>

          <View className="flex flex-row justify-between items-center w-full mb-3">
            <View className="flex flex-row items-center gap-1.5 flex-1">
              <View className="mr-3">
                <TouchableOpacity
                  onPress={handleCheckboxClick}
                  className={`
                    h-5 w-5 rounded-md border-2 flex items-center justify-center
                    ${isSelected ? "bg-blue-500 border-blue-500" : "bg-transparent border-zinc-400 dark:border-zinc-600"}
                  `}
                >
                  <Text>
                    {isSelected && (
                      <AntDesign name="check" size={16} color="white" />
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <Entypo
                  name="upload-to-cloud"
                  size={16}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                />
              </View>
              <View className="flex flex-col gap-0.5 flex-1">
                <Text
                  className={`
                  line-clamp-1 truncate font-semibold 
                  text-zinc-900 dark:text-zinc-100
                `}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {transaction.description || "Transaction"}
                </Text>
                <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                  ID: {transaction.id.slice(0, 8)}...
                </Text>
              </View>
            </View>

            <View className="flex flex-row items-center gap-1.5 ml-4">
              <AntDesign
                name="calendar"
                size={12}
                color={isDark ? "#a1a1aa" : "#71717a"}
              />
              <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                Pagamento: {formatDate(transaction.date)}
              </Text>
            </View>
          </View>

          <View className="flex flex-row justify-between items-center">
            <Text
              className={`
            text-2xl font-semibold tracking-tight 
            ${getTypeColor(transaction.type)}
          `}
            >
              {formatCurrency(transaction.amount)}
            </Text>

            <View
              className={`
            flex flex-row items-center px-2 py-1 rounded-full border 
            ${
              transaction.isRecurring
                ? "border-orange-200/50 bg-orange-100/50 dark:border-orange-700/50 dark:bg-orange-900/20"
                : "border-zinc-200/50 bg-zinc-100/50 dark:border-zinc-700/50 dark:bg-zinc-800/50"
            }
          `}
            >
              {transaction.isRecurring && (
                <Feather
                  name="repeat"
                  size={12}
                  color={isDark ? "#f97316" : "#ea580c"}
                  className="mr-1"
                />
              )}
              <Text
                className={`
              text-xs 
              ${
                transaction.isRecurring
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-zinc-600 dark:text-zinc-300"
              }
            `}
              >
                {getTypeLabel(transaction.type)}
              </Text>
            </View>
          </View>
        </View>
      </CustomTouchableOpacity>
    </View>
  );
};

export default CardTransaction;
