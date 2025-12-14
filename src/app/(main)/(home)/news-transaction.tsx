import CreateTransactionForm from "@/components/form/transaction-form";
import { useClerkUser } from "@/hooks/useClerkUser";
import {
  handleSubmitNewsTransaction,
  useTransactionQuery,
} from "@/services/query/transactions.query";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

const NewsTransactionPage = () => {
  const { user, loading } = useClerkUser();
  const { refetchTransaction } = useTransactionQuery(user?.id as string);
  const router = useRouter();

  if (loading) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center dark:bg-zinc-900">
        <ActivityIndicator size="large" />
        <Text className="dark:text-white mt-6">Carregando usuário...</Text>
      </View>
    );
  }

  const handleCancel = () => {
    router.push("/(main)/(home)");
  };

  return (
    <View className="flex-1">
      <CreateTransactionForm
        userId={user?.id as string}
        onSubmit={handleSubmitNewsTransaction}
        mode="create"
        onCancel={handleCancel}
        refetch={refetchTransaction}
      />
    </View>
  );
};

export default NewsTransactionPage;
