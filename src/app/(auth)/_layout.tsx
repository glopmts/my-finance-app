import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

export default function AuthRoutesLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/(main)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
