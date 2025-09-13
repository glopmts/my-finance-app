import { UserProvider } from "@/contexts/UserContext";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";

export default function MainLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

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
      <>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: isDark ? "#27272a" : "#ffff",
              borderTopWidth: 0,
              height: 60,
            },
            tabBarActiveTintColor: isDark ? "#3b82f6" : "#3b82f6",
            tabBarInactiveTintColor: "#888",
            animation: "none",
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="transactions"
            options={{
              title: "Transações",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="finance"
                  color={color}
                  size={size}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="news-transaction"
            options={{
              title: "Nova tranasação",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="newspaper-plus"
                  color={color}
                  size={size}
                />
              ),
            }}
          />
        </Tabs>
      </>
    </UserProvider>
  );
}
