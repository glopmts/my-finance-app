import GetSalaryQuery from "@/services/query/salary.query";
import GetTransactionsQuery from "@/services/query/transactions.query";
import { TransactionProps } from "@/types/interfaces";
import { ActivityIndicator, Text, View } from "react-native";
import Alert from "../Alert-Infor";
import SalaryCard from "../cards/card-salary";
import ProgressBar from "../ProgressBar";

type PropsUser = {
  userId: string;
};

const InforCarSalary = ({ userId }: PropsUser) => {
  const { salary, error, isLoading, refetch } = GetSalaryQuery(userId);
  const { mockTransaction, loader } = GetTransactionsQuery(userId);

  function calculateTotalExpenses(transactions: TransactionProps[]) {
    if (!Array.isArray(transactions)) return 0;
    return transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
  }

  if (isLoading || loader) {
    return (
      <View className="w-full h-full flex-1 items-center justify-center bg-zinc-900">
        <ActivityIndicator size={30} color="#ffff" />
      </View>
    );
  }

  if (!salary || salary.length === 0) {
    return (
      <Alert
        type="warning"
        title="Salário não encontrado"
        message="Cadastre seu salário para começar a controlar suas finanças"
        actionText="Cadastrar Salário"
        onActionPress={() => console.log("Cadastrar salário")}
      />
    );
  }

  if (!mockTransaction || mockTransaction.length === 0) {
    return (
      <Alert
        type="warning"
        title="Nenhuma transação encontrada!"
        message="Você ainda não possui transações cadastradas. Adicione sua primeira transação"
        actionText="Cadastrar Salário"
        onActionPress={() => console.log("Cadastrar salário")}
      />
    );
  }

  const maxValue = salary[0]?.amount || 0;
  const totalExpenses = calculateTotalExpenses(mockTransaction);
  const progressValue = Math.min((totalExpenses / maxValue) * 100, 100);
  const isOverLimit = totalExpenses > maxValue;

  return (
    <View>
      <View className="mb-4">
        <Text className="dark:text-white font-semibold text-2xl">
          Gestão de Salários
        </Text>
      </View>

      <View>
        <View className="lg:col-span-2 space-y-4">
          {salary.map((card) => (
            <SalaryCard
              key={card.id}
              salary={card}
              progressValue={progressValue}
              isOverLimit={isOverLimit}
            />
          ))}
        </View>
      </View>

      <View className="mt-9">
        <View className="pb-3">
          <Text className="dark:text-white font-semibold text-2xl">
            Gerenciar Finanças
          </Text>
        </View>
        <ProgressBar userId={userId} maxValue={maxValue} />
      </View>
    </View>
  );
};

export default InforCarSalary;
