import TransactionsPage from "@/components/home/card-transactions-user";
import { useClerkUser } from "@/hooks/useClerkUser";
import { ActivityIndicator, Text, View } from "react-native";

const Transactions = () => {
  const { user, loading, isAuthenticated } = useClerkUser();

  if (loading) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center dark:bg-zinc-900">
        <ActivityIndicator size="large" />
        <Text className="text-white mt-6">Carregando usuário...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center dark:bg-zinc-900">
        <Text className="text-white">Usuário não autenticado</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 dark:bg-zinc-900 px-4"
      style={{
        paddingTop: 10,
      }}
    >
      <View className="mt-10">
        <TransactionsPage userId={user?.id as string} />
      </View>
    </View>
  );
};

export default Transactions;
