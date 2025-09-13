import GetSalaryQuery from "@/services/query/salary.query";
import GetTransactionsQuery from "@/services/query/transactions.query";
import { TransactionProps } from "@/types/interfaces";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Alert from "../Alert-Infor";
import SalaryCard from "../cards/card-salary";

type PropsUser = {
  userId: string;
};

const InforCarSalary = ({ userId }: PropsUser) => {
  const { salary, error, isLoading, refetch } = GetSalaryQuery(userId);

  const { mockTransaction, errorTransaction, loader, refetchTransaction } =
    GetTransactionsQuery(userId);

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

  if (!salary) {
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

  if (!mockTransaction) {
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

  const maxValueFilter = salary.map((c) => c.amount);
  const maxValue = maxValueFilter[0];

  const totalExpenses = calculateTotalExpenses(mockTransaction);
  const progressValue = Math.min((totalExpenses / maxValue) * 100, 100);
  const isOverLimit = totalExpenses > maxValue;

  return (
    <TouchableOpacity activeOpacity={0.7}>
      <View>
        <View className="mb-4">
          <Text className="dark:text-white font-semibold text-2xl">
            Gestão de Salários
          </Text>
        </View>
        <View>
          <View className="lg:col-span-2 space-y-4">
            {salary?.map((card) => (
              <SalaryCard
                key={card.id}
                salary={card}
                progressValue={progressValue}
                isOverLimit={isOverLimit}
              />
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default InforCarSalary;
