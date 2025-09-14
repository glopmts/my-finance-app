import Header from "@/components/Header";
import InforCarSalary from "@/components/home/card-infor-salary";
import { InlineLoading } from "@/components/Loading";
import { useClerkUser } from "@/hooks/useClerkUser";
import { Text, View } from "react-native";

const HomePage = () => {
  const { user, loading, error, isAuthenticated } = useClerkUser();

  if (loading) {
    return <InlineLoading message="Carregando..." size="large" />;
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
        <Text className="dark:text-white font-semibold text-2xl">
          Usuário não autenticado
        </Text>
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
