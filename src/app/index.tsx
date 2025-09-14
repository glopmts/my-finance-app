import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

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

  return (
    <View>
      {isSignedIn ? (
        <Redirect href="/(auth)/sign-in" />
      ) : (
        <Redirect href="/(main)/(home)" />
      )}
    </View>
  );
}
