import { showPlatformMessage } from "@/components/alerts/ToastMessage";
import CreateTransactionForm from "@/components/form/transaction-form";
import { useClerkUser } from "@/hooks/useClerkUser";
import { API_BASE_URL } from "@/lib/api-from-url";
import { useTransactionQuery } from "@/services/query/transactions.query";
import { TransactionPropsCreater } from "@/types/transaction-props";
import { useRouter } from "expo-router";
import { Alert, Platform, ToastAndroid, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

const NewsTransactionPage = () => {
  const { user, loading } = useClerkUser();
  const { refetchTransaction } = useTransactionQuery(user?.id as string);
  const router = useRouter();

  const handleSubmit = async (transaction: TransactionPropsCreater) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transaction/creater`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      });

      if (response.status === 201) {
        showPlatformMessage("Transação criada com sucesso!");
      }
    } catch (error) {
      if (error instanceof Error) {
        if (Platform.OS === "android") {
          ToastAndroid.show(error.message, ToastAndroid.SHORT);
        } else {
          Alert.alert("Erro", error.message);
        }
      }
    }
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
        refetch={refetchTransaction}
      />
    </View>
  );
};

export default NewsTransactionPage;
