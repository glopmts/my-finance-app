import { InlineLoading } from "@/components/Loading";
import { useClerkUser } from "@/hooks/useClerkUser";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

const Profile = () => {
  const { user, loading, error, isAuthenticated } = useClerkUser();
  const router = useRouter();
  const deviceColorScheme = useColorScheme();

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
        paddingTop: 16,
        padding: 10,
      }}
    >
      <View className="mt-8 px-3">
        <View className="pb-6 flex-row gap-4">
          <View>
            <TouchableOpacity
              onPress={() => router.back()}
              className="dark:bg-zinc-800 bg-gray-300 p-1 rounded-full border dark:border-zinc-700"
            >
              <Ionicons
                name="arrow-back"
                size={26}
                color={deviceColorScheme === "dark" ? "#fff" : ""}
              />
            </TouchableOpacity>
          </View>
          <View>
            <Text className="text-2xl font-semibold dark:text-white">
              Perfil
            </Text>
            <Text>Olá, {user?.name || "Usuário"}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Profile;
