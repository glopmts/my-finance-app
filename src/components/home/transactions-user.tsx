import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import Alert from "@/components/alerts/alert-infors";
import CardTransaction from "@/components/cards/card-transactions";
import DateSelector from "@/components/date-selector";
import ListWrapper from "@/components/list-wrapper";
import { useTransactionsPage } from "@/hooks/useTransactionsPage";

type PropsUser = {
  userId: string;
};

const TransactionsPage = ({ userId }: PropsUser) => {
  const deviceColorScheme = useColorScheme();

  const {
    selectedDate,
    selectedTransactions,
    isSelecting10,
    isDeleting,
    refreshing,
    transactions,
    isLoadingTransactions,
    transactionsError,
    filteredTransactions,
    paginatedTransactions,
    setSelectedDate,
    handleRefresh,
    handleEdit,
    handleDelete,
    handleSelect10Transactions,
    handleDeleteSelected,
    handleSelectTransaction,
  } = useTransactionsPage({
    userId,
    initialDate: new Date(),
  });

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

  if (!transactions || transactions.length === 0) {
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
        title="Erro ao buscar transações"
        message="Houve um erro ao buscar transações. Tente novamente!"
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

      <View className="flex-row w-full mb-2">
        <View className="pb-4 flex-row justify-between gap-2.5 w-full">
          <TouchableOpacity
            onPress={handleSelect10Transactions}
            className={`p-2 py-3 px-4 rounded-full ${
              isSelecting10
                ? "bg-blue-600 dark:bg-blue-700"
                : "bg-gray-300 dark:bg-zinc-800"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                isSelecting10 ? "text-white" : "text-black dark:text-white"
              }`}
            >
              {isSelecting10
                ? "Desmarcar 10 Transações"
                : "Selecionar 10 Transações"}
            </Text>
          </TouchableOpacity>

          {selectedTransactions.length > 0 && (
            <TouchableOpacity
              onPress={handleDeleteSelected}
              disabled={isDeleting}
              className="bg-red-600 py-3 px-4 hover:bg-red-700 text-white p-2 rounded-full flex-row items-center gap-1"
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="trash" size={16} color="white" />
                  <Text className="text-sm font-semibold text-white">
                    Excluir {selectedTransactions.length} selecionadas
                  </Text>
                </>
              )}
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
        onEmptyActionPress={() =>
          router.push("/(main)/(home)/news-transaction")
        }
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <CardTransaction
            transaction={item}
            userId={userId}
            refetch={handleRefresh}
            handleDelete={handleDelete}
            handleEdite={handleEdit}
            isSelected={selectedTransactions.includes(item.id)}
            onSelect={() => handleSelectTransaction(item.id)}
          />
        )}
      />
    </View>
  );
};

export default TransactionsPage;
