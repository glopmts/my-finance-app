import type React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

interface RNButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "success";
  isLoading?: boolean;
  children: React.ReactNode;
}

export function RNButton({
  variant = "primary",
  isLoading,
  children,
  disabled,
  ...props
}: RNButtonProps) {
  const variants = {
    primary: "bg-zinc-200",
    success: "bg-green-500",
  };

  const textColor = variant === "primary" ? "text-black" : "text-white";

  return (
    <TouchableOpacity
      className={`w-full p-4 rounded-3xl items-center ${variants[variant]} ${disabled || isLoading ? "opacity-50" : ""}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size={20}
          color={variant === "primary" ? "#000" : "#fff"}
        />
      ) : (
        <Text className={`font-bold text-base ${textColor}`}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}
