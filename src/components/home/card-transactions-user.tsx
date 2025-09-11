import { endOfMonth, isWithinInterval, parseISO, startOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, useColorScheme, View } from "react-native";
import GetTransactionsQuery from "../../services/query/transactions.query";
import { TransactionProps } from "../../types/interfaces";
import Alert from "../Alert-Infor";
import CardTransaction from "../card-transactions";
import ListWrapper from "../ListWrapper";

type PropsUser = {
  userId: string;
};

const TransactionsPage = ({ userId }: PropsUser) => {
  const deviceColorScheme = useColorScheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [transactionsToShow, setTransactionsToShow] = useState<number>(12);
  const [transactionToEdit, setTransactionToEdit] =
    useState<TransactionProps | null>(null);

  const { mockTransaction, errorTransaction, loader, refetchTransaction } =
    GetTransactionsQuery(userId);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchTransaction();
    setRefreshing(false);
  };

  const handleEdit = (transaction: TransactionProps) => {
    // Implementar edição
  };

  const handleDelete = (id: string) => {
    // Implementar exclusão
  };

  const normalizeDate = (date: Date | string): Date => {
    return typeof date === "string" ? parseISO(date) : date;
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

  const filteredTransactions = mockTransaction
    ? filterTransactionsByMonth(mockTransaction, selectedDate)
    : [];

  const paginatedTransactions = filteredTransactions.slice(
    0,
    transactionsToShow
  );

  const hasMore = filteredTransactions.length > transactionsToShow;

  const isCurrentMonth = () => {
    const now = new Date();
    return (
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear()
    );
  };

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

  if (loader) {
    return (
      <View className="w-full h-full flex-1 mt-8 items-center justify-center dark:bg-zinc-900">
        <ActivityIndicator
          size={30}
          color={deviceColorScheme === "dark" ? "#fff" : "#27272a"}
        />
      </View>
    );
  }

  if (!mockTransaction) {
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

  if (errorTransaction) {
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
    <View className="">
      <View className="mb-4">
        <Text className="dark:text-white font-semibold text-2xl">
          Gerenciar Finanças
        </Text>
        <Text className="text-base text-zinc-400 dark:text-zinc-400">
          {paginatedTransactions.length} de {filteredTransactions.length}{" "}
          transações
        </Text>
      </View>
      <ListWrapper
        data={mockTransaction}
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
            refetch={refetchTransaction}
            handleDelete={handleDelete}
            handleEdite={handleEdit}
          />
        )}
      />
    </View>
  );
};

export default TransactionsPage;
