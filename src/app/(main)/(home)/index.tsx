import Header from "@/components/Header";
import InforCarSalary from "@/components/home/card-infor-salary";
import LastestTransactionsPage from "@/components/home/lastest-user-transactions";
import { InlineLoading } from "@/components/Loading";
import { useClerkUser } from "@/hooks/useClerkUser";
import { useAuth } from "@clerk/clerk-expo";
import { QueryClient } from "@tanstack/react-query";
import { SplashScreen, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import UpdateChecker from "../../../components/UpdateChecker";

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

const HomePage = () => {
  const { user, loading, error, isAuthenticated } = useClerkUser();
  const { userId } = useAuth();
  const router = useRouter();
  const [prevUserId, setPrevUserId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) {
      const hideSplash = async () => {
        await SplashScreen.hideAsync();
      };
      hideSplash();
    }
  }, [loading]);

  useEffect(() => {
    if (prevUserId && prevUserId !== userId) {
      queryClient.clear();
      router.reload();
    }
    setPrevUserId(userId!);
  }, [userId]);

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
    <View className="flex-1 dark:bg-zinc-900">
      <View className="px-4 pt-4 bg-gray-200 dark:bg-zinc-900 z-10">
        <Header />
      </View>

      <View className="mt-3 pb-3">
        <UpdateChecker autoCheck={true} showManualButton={false} />
      </View>

      <FlatList
        data={[1]}
        renderItem={() => (
          <View className="px-4">
            {/* salary */}
            <InforCarSalary userId={user?.id as string} />
            {/* transactions */}
            <View className="mt-6">
              <LastestTransactionsPage userId={user?.id as string} />
            </View>
          </View>
        )}
        keyExtractor={(item) => item.toString()}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={null}
      />
    </View>
  );
};

export default HomePage;
