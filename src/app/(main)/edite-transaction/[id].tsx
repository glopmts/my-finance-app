import { useTransactionQuery } from "@/services/query/transactions.query";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

const EditerTransaction = () => {
  const { id } = useLocalSearchParams();

  const transactionId = id as string;

  const {
    transaction,
    isLoadingTransaction,
    transactionError,
    refetchTransaction,
  } = useTransactionQuery(transactionId);

  return (
    <View className="flex-1">
      <Text>{transaction?.amount}</Text>
    </View>
  );
};

export default EditerTransaction;
