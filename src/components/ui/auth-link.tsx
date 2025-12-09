import { Text, TouchableOpacity } from "react-native";

interface AuthLinkProps {
  message: string;
  linkText: string;
  onPress: () => void;
}

export function AuthLink({ message, linkText, onPress }: AuthLinkProps) {
  return (
    <TouchableOpacity
      className="mt-6 flex-row items-center gap-1"
      onPress={onPress}
    >
      <Text className="text-zinc-400 text-base">{message}</Text>
      <Text className="text-blue-500 font-semibold text-base">{linkText}</Text>
    </TouchableOpacity>
  );
}
