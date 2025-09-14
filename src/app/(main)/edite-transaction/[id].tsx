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
import { View } from "react-native";

const EditerTransaction = () => {
  const { id } = useLocalSearchParams();
  const transactionId = id as string;
  const { user, loading } = useClerkUser();
  const router = useRouter();

  const handleSubmit = async (transaction: TransactionUpdateProps) => {
    await TransactionService.update(transaction);
  };

  const {
    transaction,
    isLoadingTransaction,
    transactionError,
    refetchTransaction,
  } = useTransactionQuery(transactionId);

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

  return (
    <View className="flex-1">
      <TransactionForm
        userId={user?.id as string}
        transaction={transaction}
        mode="edit"
        onUpdate={handleSubmit}
        onCancel={handleCancel}
        refetch={refetchTransaction}
      />
    </View>
  );
};

export default EditerTransaction;
