import Header from "@/components/Header";
import { useClerkUser } from "@/hooks/useClerkUser";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import InforCarSalary from "../../components/home/card-infor-salary";
import TransactionsPage from "../../components/home/card-transactions-user";

const HomePage = () => {
  const { user, loading, error, isAuthenticated } = useClerkUser();

  if (loading) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center dark:bg-zinc-900">
        <ActivityIndicator size="large" />
        <Text className="text-white">Carregando usuário...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center dark:bg-zinc-900">
        <Text style={{ color: "red" }}>Erro: {error}</Text>
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
    <SafeAreaView
      className="flex-1 dark:bg-zinc-900"
      style={{
        paddingTop: 10,
      }}
    >
      <View className="flex-1 px-4">
        <Header />
        <View>
          <InforCarSalary userId={user?.id as string} />
        </View>
        <View className="mt-8">
          <TransactionsPage userId={user?.id as string} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomePage;
