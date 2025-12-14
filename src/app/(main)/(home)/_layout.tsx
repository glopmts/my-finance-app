import { useAuth } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, router, Tabs } from "expo-router";
import { useColorScheme } from "nativewind";

import { InlineLoading } from "@/components/Loading";
import { useClerkUser } from "@/hooks/useClerkUser";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: false,
  }),
});

function useNotificationObserver() {
  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;

      if (typeof url === "string" && url.startsWith("/")) {
        try {
          router.push(url as any);
        } catch (error) {
          console.error("Erro ao navegar:", error);
        }
      }
    }
    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) {
      redirect(response.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        redirect(response.notification);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);
}

export default function MainLayout() {
  const { isSignedIn } = useAuth();
  const { isAuthenticated } = useClerkUser();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  useNotificationObserver();

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
