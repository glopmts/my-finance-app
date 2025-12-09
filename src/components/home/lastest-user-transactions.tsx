import { use5TransactionsQuery } from "@/services/query/transactions.query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, useColorScheme, View } from "react-native";
import { filterTransactionsByMonth } from "../../utils/dateUtils";
import Alert from "../alerts/Alert-Infor";
import CardTransaction from "../cards/card-transactions";
import ListWrapper from "../list-wrapper";

type PropsUser = {
  userId: string;
};

const LastestTransactionsPage = ({ userId }: PropsUser) => {
  const deviceColorScheme = useColorScheme();

  const {
    recurringTransactions,
    isLoadingRecurring,
    recurringError,
    refetchRecurring,
  } = use5TransactionsQuery(userId);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const filteredTransactions = recurringTransactions
    ? filterTransactionsByMonth(recurringTransactions, selectedDate)
    : [];

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchRecurring();
    setRefreshing(false);
  };

  if (isLoadingRecurring) {
    return (
      <View className="w-full h-full flex-1 mt-8 items-center justify-center dark:bg-zinc-900">
        <ActivityIndicator
          size={30}
          color={deviceColorScheme === "dark" ? "#fff" : "#27272a"}
        />
      </View>
    );
  }

  if (!recurringTransactions) {
    return (
      <Alert
        type="warning"
        title="Nenhuma transação encontrada!"
        message="Você ainda não possui transações cadastradas. Adicione sua primeira transação"
        actionText="Cadastrar transação"
        onActionPress={() => router.push("/news-transaction")}
      />
    );
  }

  if (recurringError) {
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
            últimas 5 transações
          </Text>
          <Text className="text-base text-zinc-400 dark:text-zinc-400"></Text>
        </View>
        <MaterialCommunityIcons
          name="refresh"
          color={deviceColorScheme === "dark" ? "#fff" : "#27272a"}
          size={25}
        />
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
            refetch={refetchRecurring}
            handleDelete={() => {}}
            handleEdite={() => {}}
          />
        )}
      />
    </View>
  );
};

export default LastestTransactionsPage;
