import { useTransactionsQuery } from "@/services/query/transactions.query";
import { TransactionProps } from "@/types/interfaces";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { endOfMonth, isWithinInterval, parseISO, startOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert as AlertReact,
  Platform,
  Text,
  ToastAndroid,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { TransactionService } from "../../services/transactions.service";
import Alert from "../alerts/Alert-Infor";
import CardTransaction from "../cards/card-transactions";
import DateSelector from "../DateSelectorProps";
import ListWrapper from "../ListWrapper";

type PropsUser = {
  userId: string;
};

const TransactionsPage = ({ userId }: PropsUser) => {
  const deviceColorScheme = useColorScheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    []
  );
  const [isSelecting10, setIsSelecting10] = useState(false);
  const [isDeleteing, setIsDeleting] = useState(false);

  const {
    transactions,
    isLoadingTransactions,
    transactionsError,
    refetchTransactions,
  } = useTransactionsQuery(userId);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchTransactions();
    setRefreshing(false);
  };

  const handleEdit = (transaction: TransactionProps) => {
    // Implementar edição
  };

  const handleDelete = (id: string) => {
    // Implementar exclusão
  };

  function filterTransactionsByMonth(
    transactions: TransactionProps[],
    date: string
  ): TransactionProps[];

  function filterTransactionsByMonth(
    transactions: TransactionProps[],
    date: Date
  ): TransactionProps[];

  function filterTransactionsByMonth(
    transactions: TransactionProps[],
    date: Date | string
  ): TransactionProps[] {
    const dateObj = typeof date === "string" ? parseISO(date) : date;

    const start = startOfMonth(dateObj);
    const end = endOfMonth(dateObj);

    return transactions.filter((transaction) => {
      const transactionDate = parseISO(transaction.date);
      return isWithinInterval(transactionDate, { start, end });
    });
  }

  const filteredTransactions = transactions
    ? filterTransactionsByMonth(transactions, selectedDate)
    : [];

  const paginatedTransactions = filteredTransactions.slice(0);

  useEffect(() => {
    const checkMonthChange = () => {
      const now = new Date();
      if (
        now.getMonth() !== selectedDate.getMonth() ||
        now.getFullYear() !== selectedDate.getFullYear()
      ) {
        setSelectedDate(now);
      }
    };

    const interval = setInterval(checkMonthChange, 3600000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const handleSelect10Transactions = () => {
    if (isSelecting10) {
      setSelectedTransactions([]);
      setIsSelecting10(false);
    } else {
      const first10Ids = paginatedTransactions
        .slice(0, 10)
        .map((transaction) => transaction.id);

      setSelectedTransactions(first10Ids);
      setIsSelecting10(true);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedTransactions.length > 0) {
      handleDeleteMultiple(selectedTransactions);
    }
  };

  const handleDeleteMultiple = async (selectedIds: string[]) => {
    try {
      setIsDeleting(true);
      await TransactionService.deleteMultiple(selectedIds);

      if (Platform.OS === "android") {
        ToastAndroid.show(
          "Transações deletadas com sucesso!",
          ToastAndroid.SHORT
        );
      } else {
        AlertReact.alert("Transações deletadas com sucesso!");
      }
      await refetchTransactions();
      setSelectedTransactions([]);
      setIsSelecting10(false);
      setIsDeleting(false);
    } catch (error) {
      if (error instanceof Error) {
        if (Platform.OS === "android") {
          ToastAndroid.show(
            `Erro ao deletar transações: ${error.message}`,
            ToastAndroid.SHORT
          );
        } else {
          AlertReact.alert(`Erro ao deletar transações: ${error.message}`);
        }
      } else {
        if (Platform.OS === "android") {
          ToastAndroid.show(
            "Erro desconhecido ao deletar transações",
            ToastAndroid.SHORT
          );
        } else {
          AlertReact.alert("Erro desconhecido ao deletar transações");
        }
      }
      setIsDeleting(false);
    }
  };

  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(id)
        ? prev.filter((transactionId) => transactionId !== id)
        : [...prev, id]
    );
    setIsSelecting10(false);
  };

  if (isLoadingTransactions) {
    return (
      <View className="w-full h-full flex-1 mt-8 items-center justify-center dark:bg-zinc-900">
        <ActivityIndicator
          size={30}
          color={deviceColorScheme === "dark" ? "#fff" : "#27272a"}
        />
      </View>
    );
  }

  if (!transactions) {
    return (
      <Alert
        type="warning"
        title="Nenhuma transação encontrada!"
        message="Você ainda não possui transações cadastradas. Adicione sua primeira transação"
        actionText="Cadastrar Salário"
        onActionPress={() => console.log("Cadastrar salário")}
      />
    );
  }

  if (transactionsError) {
    return (
      <Alert
        type="warning"
        title="Error ao buscar transações"
        message="Houve um error ao buscar transações. Tente novamente!"
        actionText="Cadastrar Salário"
        onActionPress={() => console.log("Cadastrar salário")}
      />
    );
  }

  return (
    <View className="w-full h-full">
      <View className="mb-4 flex-row justify-between">
        <View>
          <Text className="dark:text-white font-semibold text-2xl">
            Gerenciar Finanças
          </Text>
          <Text className="text-base text-zinc-400 dark:text-zinc-400">
            {paginatedTransactions.length} de {filteredTransactions.length}{" "}
            transações
          </Text>
        </View>
        <MaterialCommunityIcons
          name="finance"
          color={deviceColorScheme === "dark" ? "#fff" : "#27272a"}
          size={25}
        />
      </View>
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      <View className="flex-row justify-end mb-2">
        <View className="pb-4 flex-row gap-2.5">
          <TouchableOpacity
            onPress={handleSelect10Transactions}
            className={`p-2 rounded-full dark:bg-zinc-800 bg-gray-300${
              isSelecting10
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-transparent"
            }`}
          >
            <Text className="text-sm font-semibold dark:text-white">
              {isSelecting10
                ? "Desmarcar 10 Transações"
                : "Selecionar 10 Transações"}
            </Text>
          </TouchableOpacity>

          {selectedTransactions.length > 0 && (
            <TouchableOpacity
              onPress={handleDeleteSelected}
              disabled={isDeleteing}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
            >
              {isDeleteing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : null}
              <View className="flex items-center gap-2">
                <Text className="text-sm font-semibold text-white text-center gap-3 flex-row">
                  <Ionicons name="trash" size={16} color="white" />
                  Excluir {selectedTransactions.length} selecionadas
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <ListWrapper
        data={filteredTransactions}
        loading={refreshing}
        onRefresh={handleRefresh}
        emptyTitle="Nenhuma transação encontrada"
        emptyMessage="Comece adicionando sua primeira transação"
        emptyActionText="Nova Transação"
        onEmptyActionPress={() => console.log("Nova transação")}
        keyExtractor={(item) => item.id}
        renderItem={(item, index) => (
          <CardTransaction
            transaction={item}
            userId={userId}
            refetch={refetchTransactions}
            handleDelete={handleDelete}
            handleEdite={handleEdit}
            isSelected={selectedTransactions.includes(item.id)}
            onSelect={() => {
              if (selectedTransactions.includes(item.id)) {
                handleSelectTransaction(item.id);
              } else {
                handleSelectTransaction(item.id);
              }
            }}
          />
        )}
      />
    </View>
  );
};

export default TransactionsPage;
