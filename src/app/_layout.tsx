import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { PortalProvider } from "@gorhom/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";

import { useEffect, useState } from "react";
import OfflineScreen from "../components/OfflineScreen";
import { FirebaseNotificationProvider } from "../contexts/FirebaseNotificationContextType";
import { LogProvider } from "../contexts/LogContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { UserProvider } from "../contexts/UserContext";
import { NetworkProvider, useNetwork } from "../hooks/useNetwork";
import "./global.css";

SplashScreen.preventAutoHideAsync();

const publishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_bGFzdGluZy1wYXJha2VldC0xNi5jbGVyay5hY2NvdW50cy5kZXYk";

function RootLayoutNav() {
  const [isAppReady, setAppReady] = useState(false);
  const params = useLocalSearchParams();
  const { isConnected } = useNetwork();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepareApp();
  }, []);

  if (!isConnected) {
    return <OfflineScreen />;
  }

  if (!isAppReady) return null;

  return (
    <>
      <StatusBar style="auto" />
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView
          style={{
            flex: 1,
            paddingTop: 0,
          }}
        >
          <UserProvider>
            <PortalProvider>
              <PaperProvider>
                <NotificationProvider>
                  <FirebaseNotificationProvider>
                    <ThemeProvider>
                      <NetworkProvider>
                        <LogProvider>
                          <Stack
                            screenOptions={{
                              headerShown: false,
                              headerStyle: {
                                backgroundColor: "#27272a",
                              },
                              title: Array.isArray(params.name)
                                ? params.name.join(", ")
                                : params.name,
                            }}
                          ></Stack>
                        </LogProvider>
                      </NetworkProvider>
                    </ThemeProvider>
                  </FirebaseNotificationProvider>
                </NotificationProvider>
              </PaperProvider>
            </PortalProvider>
          </UserProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <RootLayoutNav />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
