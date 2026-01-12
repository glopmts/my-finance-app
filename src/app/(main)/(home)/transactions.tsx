import TransactionsUserCard from "@/components/home/transactions-user-card";
import { InlineLoading } from "@/components/Loading";
import { useClerkUser } from "@/hooks/useClerkUser";
import { Text, View } from "react-native";

const Transactions = () => {
  const { user, loading, isAuthenticated } = useClerkUser();

  if (loading) {
    return <InlineLoading size="large" />;
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 w-full h-full min-h-screen items-center justify-center dark:bg-zinc-900">
        <Text className="dark:text-white">Usuário não autenticado</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 dark:bg-zinc-900 px-4"
      style={{
        paddingTop: 16,
      }}
    >
      <View className="mt-10">
        <TransactionsUserCard userId={user?.id as string} />
      </View>
    </View>
  );
};

export default Transactions;
