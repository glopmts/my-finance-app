import EmptyState from "@/components/alerts/EmptyState";
import { showPlatformMessage } from "@/components/alerts/ToastMessage";
import TransactionForm from "@/components/form/transaction-form";
import { InlineLoading } from "@/components/Loading";
import { useClerkUser } from "@/hooks/useClerkUser";
import { useTransactionQuery } from "@/services/query/transactions.query";
import { TransactionService } from "@/services/transactions.service";
import { TransactionUpdateProps } from "@/types/transaction-props";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, View } from "react-native";

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
    return <InlineLoading message="Carregando..." size="large" />;
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

              showPlatformMessage("Transação excluída com sucesso!");
              router.push("/(main)/(home)");
              Alert.alert("Sucesso", "Transação excluída com sucesso!");
              refetchTransaction();
            } catch (error) {
              if (error instanceof Error) {
                const errorMessage =
                  error.message || "Erro ao excluir transação.";
                showPlatformMessage(errorMessage);
              }
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
