import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { Text, View } from "react-native";
import { UserProvider } from "../../contexts/UserContext";

export default function MainLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View className="w-full h-screen flex-1">
        <View className="flex items-center justify-center w-full h-full">
          <Text>Carregando...</Text>
        </View>
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UserProvider>
  );
}
