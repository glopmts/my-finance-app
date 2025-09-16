import EmptyState from "@/components/EmptyState";
import { InlineLoading } from "@/components/Loading";
import TransactionForm from "@/components/TransactionForm";
import { useClerkUser } from "@/hooks/useClerkUser";
import { useTransactionQuery } from "@/services/query/transactions.query";
import {
  TransactionService,
  TransactionUpdateProps,
} from "@/services/transactions.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Platform, ToastAndroid, View } from "react-native";

const EditerTransaction = () => {
  const { id } = useLocalSearchParams();
  const transactionId = id as string;
  const { user, loading } = useClerkUser();
  const userId = user?.id as string;
  const router = useRouter();

  const {
    transaction,
    isLoadingTransaction,
    transactionError,
    refetchTransaction,
  } = useTransactionQuery(transactionId);

  const handleSubmit = async (transaction: TransactionUpdateProps) => {
    await TransactionService.update(transaction);
  };

  if (loading || isLoadingTransaction) {
    return <InlineLoading message="Carregando..." size="small" />;
  }

  if (transactionError) {
    return (
      <EmptyState
        title="Error ao carregar dados transação!"
        message="Houve um error ao carregar os dados. Tente novamente mais tarder"
        onActionPress={() => router.push("/(main)/(home)")}
      />
    );
  }

  const handleCancel = () => {
    router.push("/(main)/(home)");
  };

  const handleDelete = async (transactionId: string) => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir esta transação?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await TransactionService.delete(transactionId, userId);

              if (Platform.OS === "android") {
                ToastAndroid.show(
                  "Transação excluída com sucesso!",
                  ToastAndroid.SHORT
                );
                router.back();
                refetchTransaction();
              } else {
                Alert.alert("Sucesso", "Transação excluída com sucesso!");
                router.back();
                refetchTransaction();
              }
            } catch (error) {
              if (Platform.OS === "android") {
                ToastAndroid.show(
                  "Erro ao excluir transação",
                  ToastAndroid.SHORT
                );
              } else {
                Alert.alert("Erro", "Não foi possível excluir a transação");
              }
              console.error("Erro ao excluir transação:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="flex-1">
      <TransactionForm
        userId={user?.id as string}
        transaction={transaction}
        mode="edit"
        onUpdate={handleSubmit}
        onCancel={handleCancel}
        refetch={refetchTransaction}
        transactionId={transactionId}
        handleDelete={handleDelete}
      />
    </View>
  );
};

export default EditerTransaction;
