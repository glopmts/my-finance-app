import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { PortalProvider } from "@gorhom/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

import { UserProvider } from "../contexts/UserContext";
import "./global.css";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: true,
});

const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

function RootLayoutNav() {
  return (
    <>
      <StatusBar style="auto" />
      <GestureHandlerRootView
        style={{
          flex: 1,
          paddingTop: 0,
        }}
      >
        <PortalProvider>
          <PaperProvider>
            <UserProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              ></Stack>
            </UserProvider>
          </PaperProvider>
        </PortalProvider>
      </GestureHandlerRootView>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ClerkLoaded>
          <RootLayoutNav />
        </ClerkLoaded>
      </ClerkProvider>
    </QueryClientProvider>
  );
}
