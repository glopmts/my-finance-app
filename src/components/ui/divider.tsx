import { Text, View } from "react-native";

interface DividerProps {
  text?: string;
}

export function Divider({ text = "Ou" }: DividerProps) {
  return (
    <View className="flex-row items-center my-4 w-full">
      <View className="flex-1 h-px bg-zinc-700" />
      <Text className="text-zinc-400 mx-4">{text}</Text>
      <View className="flex-1 h-px bg-zinc-700" />
    </View>
  );
}
