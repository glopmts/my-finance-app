import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

interface LoadingProps {
  message?: string;
  size?: "small" | "large";
  color?: string;
  overlay?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Loading: React.FC<LoadingProps> = ({
  message,
  size = "large",
  color,
  overlay = false,
  style,
  textStyle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const defaultColor = color || (isDark ? "#60a5fa" : "#3b82f6");

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: overlay
        ? isDark
          ? "rgba(0, 0, 0, 0.8)"
          : "rgba(0, 0, 0, 0.5)"
        : "transparent",
      padding: 20,
    },
    overlayContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    loadingContent: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: overlay
        ? isDark
          ? "#1f2937"
          : "#ffffff"
        : "transparent",
      borderRadius: overlay ? 16 : 0,
      padding: overlay ? 24 : 0,
      minWidth: overlay ? 120 : "auto",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: overlay ? 0.25 : 0,
      shadowRadius: overlay ? 4 : 0,
      elevation: overlay ? 5 : 0,
    },
    messageText: {
      marginTop: 16,
      fontSize: 16,
      fontWeight: "500",
      color: isDark ? "#e5e7eb" : "#374151",
      textAlign: "center",
      lineHeight: 22,
    },
    pulseContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
  });

  const LoadingContent = () => (
    <View style={[dynamicStyles.loadingContent, style]}>
      <View style={dynamicStyles.pulseContainer}>
        <ActivityIndicator size={size} color={defaultColor} />
      </View>
      {message && (
        <Text style={[dynamicStyles.messageText, textStyle]}>{message}</Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View style={[dynamicStyles.container, dynamicStyles.overlayContainer]}>
        <LoadingContent />
      </View>
    );
  }

  return (
    <View style={[dynamicStyles.container, style]}>
      <LoadingContent />
    </View>
  );
};

export const SimpleLoading: React.FC<Omit<LoadingProps, "message">> = (
  props
) => {
  return <Loading {...props} />;
};

export const MessageLoading: React.FC<LoadingProps & { message: string }> = (
  props
) => {
  return <Loading {...props} />;
};

// Componente para loading inline (menor)
export const InlineLoading: React.FC<{
  color?: string;
  size?: "small" | "large";
  message?: string;
}> = ({ color, size = "small", message }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const defaultColor = color || (isDark ? "#60a5fa" : "#3b82f6");

  return (
    <View
      style={[
        inlineStyles.container,
        { backgroundColor: isDark ? "#18181b" : "#ffffff" },
      ]}
    >
      <ActivityIndicator size={size} color={defaultColor} />
      {message && (
        <Text
          style={[inlineStyles.text, { color: isDark ? "#e5e7eb" : "#374151" }]}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

const inlineStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "400",
  },
});

export default Loading;

// Exemplos de uso:
/*
// Loading básico
<Loading />

// Loading com mensagem
<Loading message="Carregando transações..." />

// Loading com overlay (modal)
<Loading 
  message="Salvando dados..." 
  overlay={true}
  size="large"
  color="#10b981"
/>

// Loading simples
<SimpleLoading size="small" />

// Loading com mensagem obrigatória
<MessageLoading message="Processando pagamento..." />

// Loading inline
<InlineLoading message="Carregando..." size="small" />

// Loading customizado
<Loading
  message="Sincronizando..."
  style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
  textStyle={{ color: '#ff6b6b', fontSize: 18 }}
  color="#ff6b6b"
/>
*/
