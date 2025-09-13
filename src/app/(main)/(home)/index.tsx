import Header from "@/components/Header";
import InforCarSalary from "@/components/home/card-infor-salary";
import { useClerkUser } from "@/hooks/useClerkUser";
import { ActivityIndicator, Text, View } from "react-native";

const HomePage = () => {
  const { user, loading, error, isAuthenticated } = useClerkUser();

  if (loading) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center dark:bg-zinc-900">
        <ActivityIndicator size="large" />
        <Text className="dark:text-white">Carregando usuário...</Text>
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
        <Text className="dark:text-white">Usuário não autenticado</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 dark:bg-zinc-900"
      style={{
        paddingTop: 10,
      }}
    >
      <View className="flex-1 px-4">
        <Header />
        <InforCarSalary userId={user?.id as string} />
        {/* <View className="mt-8">
          <TransactionsPage userId={user?.id as string} />
        </View> */}
      </View>
    </View>
  );
};

export default HomePage;
