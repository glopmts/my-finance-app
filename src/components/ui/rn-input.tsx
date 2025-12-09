import { Text, TextInput, View, type TextInputProps } from "react-native";

interface RNInputProps extends TextInputProps {
  label?: string;
}

export function RNInput({ label, ...props }: RNInputProps) {
  return (
    <View className="w-full gap-2">
      {label && <Text className="text-zinc-300 text-base">{label}</Text>}
      <TextInput
        className="w-full p-4 border text-white border-zinc-600 rounded-xl bg-zinc-800/50"
        placeholderTextColor="#71717a"
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
}
