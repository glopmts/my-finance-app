import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      const hideSplash = async () => {
        await SplashScreen.hideAsync();
      };
      hideSplash();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#09090b",
        }}
      >
        <ActivityIndicator size={30} color="#ffff" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(main)/(home)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
