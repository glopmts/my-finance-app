import { InlineLoading } from "@/components/Loading";
import { useClerkUser } from "@/hooks/useClerkUser";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { QueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
const queryClient = new QueryClient();

const Profile = () => {
  const { user, loading, error, isAuthenticated, signOut } = useClerkUser();
  const router = useRouter();
  const deviceColorScheme = useColorScheme();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair da sua conta?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            queryClient.clear();

            setIsSigningOut(true);
            await signOut();
            router.replace("/(auth)/sign-in");
            setTimeout(() => {
              router.reload();
            }, 100);
          } catch (error) {
            console.error("Erro ao fazer logout:", error);
            Alert.alert(
              "Erro",
              "Não foi possível fazer logout. Tente novamente."
            );
          } finally {
            setIsSigningOut(false);
          }
        },
      },
    ]);
  };

  const ProfileOption = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    isDestructive = false,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4 px-4 bg-white dark:bg-zinc-800 rounded-xl mb-3 border border-gray-200 dark:border-zinc-700"
      style={{
        shadowColor: deviceColorScheme === "dark" ? "#000" : "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View className="mr-4">
        <Ionicons
          name={icon as any}
          size={24}
          color={
            isDestructive
              ? "#ef4444"
              : deviceColorScheme === "dark"
                ? "#fff"
                : "#374151"
          }
        />
      </View>
      <View className="flex-1">
        <Text
          className={`text-lg font-medium ${
            isDestructive ? "text-red-500" : "text-gray-900 dark:text-white"
          }`}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </Text>
        )}
      </View>
      {showArrow && !isDestructive && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={deviceColorScheme === "dark" ? "#9ca3af" : "#6b7280"}
        />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return <InlineLoading message="Carregando..." size="large" />;
  }

  if (error) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center bg-white dark:bg-zinc-900">
        <Ionicons
          name="alert-circle"
          size={48}
          color={deviceColorScheme === "dark" ? "#ef4444" : "#ef4444"}
        />
        <Text className="text-red-500 text-lg font-medium mt-4 text-center px-4">
          Erro: {error}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 px-6 py-3 bg-blue-500 rounded-xl"
        >
          <Text className="text-white font-medium">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 w-full h-full items-center justify-center bg-white dark:bg-zinc-900">
        <Ionicons
          name="person-circle-outline"
          size={64}
          color={deviceColorScheme === "dark" ? "#6b7280" : "#9ca3af"}
        />
        <Text className="text-gray-700 dark:text-white font-semibold text-2xl mt-4">
          Usuário não autenticado
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/sign-in")}
          className="mt-6 px-6 py-3 bg-blue-500 rounded-xl"
        >
          <Text className="text-white font-medium">Fazer Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-zinc-900">
      <ScrollView
        style={{ paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-8 mt-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white dark:bg-zinc-800 p-2 rounded-full border border-gray-200 dark:border-zinc-700"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={deviceColorScheme === "dark" ? "#fff" : "#374151"}
              />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Perfil
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* User Info Card */}
          <View
            className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-gray-200 dark:border-zinc-700"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="items-center">
              {user?.image ? (
                <Image
                  source={{ uri: user.image }}
                  className="w-20 h-20 rounded-full mb-4"
                />
              ) : (
                <View className="w-20 h-20 rounded-full bg-blue-500 items-center justify-center mb-4">
                  <Text className="text-white text-2xl font-bold">
                    {user?.name?.charAt(0) || user?.name?.charAt(0) || "U"}
                  </Text>
                </View>
              )}
              <Text className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {user?.name || `${user?.name || ""}`.trim() || "Usuário"}
              </Text>
              {user?.email && (
                <Text className="text-gray-500 dark:text-gray-400 text-center">
                  {user.email}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Profile Options */}
        <View className="px-4 mb-8">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configurações
          </Text>

          <ProfileOption
            icon="help-circle-outline"
            title="Ajuda e Suporte"
            subtitle="Central de ajuda"
            onPress={() => {
              // Implementar navegação para ajuda
              Alert.alert("Em breve", "Funcionalidade em desenvolvimento");
            }}
          />

          <ProfileOption
            icon="information-circle-outline"
            title="Sobre o App"
            subtitle="Versão, termos e políticas"
            onPress={() => {
              Alert.alert(
                "Sobre o App",
                `Versão: ${Constants.expoConfig?.version || "1.0.0"}\nBuild: ${Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || "N/A"}`
              );
            }}
          />
        </View>

        {/* Sign Out Section */}
        <View className="px-4 mb-8">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Conta
          </Text>

          <ProfileOption
            icon={isSigningOut ? "reload" : "log-out-outline"}
            title={isSigningOut ? "Saindo..." : "Sair"}
            onPress={handleSignOut}
            showArrow={false}
            isDestructive={true}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

export default Profile;
