import { useAuth } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useColorScheme } from "nativewind";

import { InlineLoading } from "@/components/Loading";
import { useClerkUser } from "@/hooks/useClerkUser";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function MainLayout() {
  const { isSignedIn } = useAuth();
  const { isAuthenticated } = useClerkUser();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!isAuthenticated) {
    return (
      <InlineLoading message="Carregando dados do usuário..." size="large" />
    );
  }

  return (
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
        tabBarBadgeStyle: {
          borderRadius: 16,
        },
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
            <MaterialCommunityIcons name="finance" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="news-transaction"
        options={{
          title: "Nova transação",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="newspaper-plus"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="logs-aplication"
        options={{
          title: "Logs",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
