import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function OAuthCallback() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSignedIn) {
        router.replace("/(main)/(home)");
      } else {
        router.replace("/(auth)/sign-in");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isSignedIn]);

  return (
    <View
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      className="dark:bg-zinc-900"
    >
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10, color: "white" }}>
        Completando login...
      </Text>
    </View>
  );
}
