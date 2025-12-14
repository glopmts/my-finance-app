import FormAutouSalaryUser from "@/components/form-auto-salary";
import { InlineLoading } from "@/components/Loading";
import { useClerkUser } from "@/hooks/useClerkUser";
import GetSalaryQuery from "@/services/query/salary.query";
import { SalaryService } from "@/services/salary.service";
import { Salary, SalaryCreater } from "@/types/interfaces";
import { useRouter } from "expo-router";
import { Alert, View } from "react-native";

const SalaryPage = () => {
  const { user, loading } = useClerkUser();
  const { salary, isLoading, refetch } = GetSalaryQuery(user?.id as string);
  const router = useRouter();

  if (loading || isLoading) {
    return <InlineLoading message="Carregando..." size="large" />;
  }

  const handleSalaryCreate = async (
    salaryData: Omit<Salary, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const createData: SalaryCreater = {
        ...salaryData,
        createdAt: new Date().toISOString(),
      };

      await SalaryService.create(createData);
      refetch();
      router.back();
    } catch (error) {
      console.error("Erro ao criar salário:", error);
      Alert.alert("Erro", "Não foi possível criar o salário");
    }
  };

  const handleSalaryUpdate = async (
    salaryData: Omit<Salary, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      if (salary && salary[0]) {
        const updateData: Salary = {
          ...salaryData,
          id: salary[0].id,
          createdAt: salary[0].createdAt,
          updatedAt: new Date().toISOString(),
        };

        await SalaryService.updater(updateData);
        router.back();
        refetch();
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o salário" + error);
    }
  };

  const hasSalary = salary && salary.length > 0 && salary[0];

  return (
    <View className="flex-1">
      {hasSalary ? (
        <FormAutouSalaryUser
          userId={user?.id as string}
          onSubmit={handleSalaryUpdate}
          salary={salary[0]}
          onCancel={() =>
            router.push({
              pathname: "/(main)/(home)",
            })
          }
          onBack={() =>
            router.push({
              pathname: "/(main)/(home)",
            })
          }
        />
      ) : (
        <FormAutouSalaryUser
          userId={user?.id as string}
          onSubmit={handleSalaryCreate}
          onCancel={() => router.back()}
        />
      )}
    </View>
  );
};

export default SalaryPage;
