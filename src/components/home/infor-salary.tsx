import GetSalaryQuery from "@/services/query/salary.query";
import GetTransactionsQuery from "@/services/query/transactions.query";
import { Transaction } from "@/types/transaction-props";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import Alert from "../alerts/alert-infors";
import SalaryCard from "../cards/card-salary";
import ProgressSpending from "../progress-spending";
import { SalarySkeleton } from "../SkeletonLoading";

type PropsUser = {
  userId: string;
};

const InforCarSalary = ({ userId }: PropsUser) => {
  const { salary, isLoading } = GetSalaryQuery(userId);
  const { mockTransaction, loader } = GetTransactionsQuery(userId);
  const router = useRouter();

  function calculateTotalExpenses(transactions: Transaction[]) {
    if (!Array.isArray(transactions)) return 0;
    return transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
  }

  if (isLoading || loader) {
    return (
      <View className="w-full h-full flex-1 bg-zinc-900">
        <SalarySkeleton />
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
        onActionPress={() => router.push("/(main)/salary-form")}
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
        onActionPress={() => router.push("/(main)/(home)/news-transaction")}
      />
    );
  }

  const maxValueFilter = salary.map((c) => c.amount);
  const maxValue = maxValueFilter[0];

  const totalExpenses = calculateTotalExpenses(mockTransaction);
  const progressValue = Math.min((totalExpenses / maxValue) * 100, 100);
  const isOverLimit = totalExpenses > maxValue;

  return (
    <View>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="dark:text-white font-semibold text-2xl">
          Gestão de Salários
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(main)/salary-form")}
          className="dark:bg-zinc-800 bg-gray-300 shadow p-3 px-4 rounded-full"
        >
          <Text className="dark:text-zinc-300 font-semibold text-xl">
            {salary ? "Atualizar Salario" : "Add Salario"}
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        <View className="lg:col-span-2 space-y-4">
          {salary.map((card) => (
            <SalaryCard
              key={card.id}
              salary={card}
              progressValue={progressValue}
              isOverLimit={isOverLimit}
              transactions={mockTransaction}
              isLoading={isLoading}
              userId={userId}
            />
          ))}
        </View>
      </View>

      {/* Progress expenses */}
      <View className="mt-9">
        <View className="pb-3">
          <Text className="dark:text-white font-semibold text-2xl">
            Gerenciar Finanças
          </Text>
        </View>
        <ProgressSpending userId={userId} maxValue={maxValue} />
      </View>
    </View>
  );
};

export default InforCarSalary;
