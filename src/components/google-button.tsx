import { Image } from "expo-image";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  type TouchableOpacityProps,
} from "react-native";

const GOOGLE_ICON_URL =
  "https://k75mjkjgco.ufs.sh/f/wiGIa3OsPCpWzuXIRyPon6dckLa5ORyXgs3FjENvVYe4Dbmi";

interface GoogleButtonProps extends TouchableOpacityProps {
  isLoading?: boolean;
}

export function GoogleButton({
  isLoading,
  disabled,
  ...props
}: GoogleButtonProps) {
  return (
    <TouchableOpacity
      className={`bg-zinc-300 w-full p-3 rounded-3xl ${disabled || isLoading ? "opacity-50" : ""}`}
      disabled={disabled || isLoading}
      {...props}
    >
      <View className="flex-row justify-center items-center gap-2">
        <Image
          source={GOOGLE_ICON_URL}
          contentFit="contain"
          style={{ width: 20, height: 20 }}
        />
        {isLoading ? (
          <ActivityIndicator size={20} color="#2563eb" />
        ) : (
          <Text className="text-black font-semibold text-lg">
            Continuar com Google
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
