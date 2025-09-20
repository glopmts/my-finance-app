import React from "react";
import { Alert, Platform, ToastAndroid } from "react-native";

interface ToastMessageProps {
  message: string;
  duration?: number;
  title?: string;
}

const ToastMessage: React.FC<ToastMessageProps> = ({
  message,
  duration = ToastAndroid.SHORT,
  title = "Aviso",
}) => {
  const showToast = () => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, duration);
    } else {
      Alert.alert(title, message);
    }
  };

  React.useEffect(() => {
    showToast();
  }, [message, duration, title]);
  return null;
};

// Hook personalizado para usar o toast
export const useToast = () => {
  const showToast = (message: string, duration?: number, title?: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, duration || ToastAndroid.SHORT);
    } else {
      Alert.alert(title || "Aviso", message);
    }
  };

  return { showToast };
};

// Função utilitária direta
export const showPlatformMessage = (
  message: string,
  duration?: number,
  title?: string
) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, duration || ToastAndroid.SHORT);
  } else {
    Alert.alert(title || "Aviso", message);
  }
};

export default ToastMessage;
