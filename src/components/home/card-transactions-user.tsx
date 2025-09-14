import { useTransactionsQuery } from "@/services/query/transactions.query";
import { TransactionProps } from "@/types/interfaces";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { endOfMonth, isWithinInterval, parseISO, startOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, useColorScheme, View } from "react-native";
import Alert from "../Alert-Infor";
import CardTransaction from "../cards/card-transactions";
import DateSelector from "../DateSelectorProps";
import ListWrapper from "../ListWrapper";

type PropsUser = {
  userId: string;
};

const TransactionsPage = ({ userId }: PropsUser) => {
  const deviceColorScheme = useColorScheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
          />
        )}
      />
    </View>
  );
};

export default TransactionsPage;
