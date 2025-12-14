import type React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface InstallUpdateScreenProps {
  visible: boolean;
  onInstall: () => void;
  onCancel: () => void;
}

export const InstallUpdateScreen: React.FC<InstallUpdateScreenProps> = ({
  visible,
  onInstall,
  onCancel,
}) => {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent={false} animationType="slide">
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.theme.background,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>✓</Text>
          </View>

          <Text style={styles.title}>Atualização Baixada!</Text>

          <Text style={styles.message}>
            A atualização foi baixada com sucesso. Toque no botão abaixo para
            instalar e reiniciar o aplicativo.
          </Text>

          <TouchableOpacity
            style={styles.installButton}
            onPress={onInstall}
            activeOpacity={0.8}
          >
            <Text style={styles.installButtonText}>Instalar e Reiniciar</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            O aplicativo será reiniciado automaticamente
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  iconText: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 24,
    marginBottom: 32,
    textAlign: "center",
  },
  installButton: {
    width: "100%",
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  installButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footerText: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
  },
});
