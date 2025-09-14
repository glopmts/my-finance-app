import CreateTransactionForm from "@/components/TransactionForm";
import { useClerkUser } from "@/hooks/useClerkUser";
import { TransactionService } from "@/services/transactions.service";
import { TransactionPropsCreater } from "@/types/interfaces";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

const NewsTransactionPage = () => {
  const { user, loading } = useClerkUser();
  const router = useRouter();

  const handleSubmit = async (transaction: TransactionPropsCreater) => {
    await TransactionService.create(transaction);
  };

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
        onSubmit={handleSubmit}
        mode="create"
        onCancel={handleCancel}
      />
    </View>
  );
};

export default NewsTransactionPage;
