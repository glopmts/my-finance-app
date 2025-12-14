import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useInstallPermission } from "../hooks/useInstallPermission";

interface PermissionCheckAlertProps {
  onComplete?: (hasPermission: boolean) => void;
}

export const PermissionCheckAlert: React.FC<PermissionCheckAlertProps> = ({
  onComplete,
}) => {
  const [visible, setVisible] = useState(false);
  const { checkInstallPermission, requestInstallPermission, hasPermission } =
    useInstallPermission();

  useEffect(() => {
    const checkPermission = async () => {
      const hasPerm = await checkInstallPermission();

      if (!hasPerm) {
        // Mostrar alerta educacional
        setVisible(true);
      } else if (onComplete) {
        onComplete(true);
      }
    };

    // Verificar após um breve delay
    const timer = setTimeout(() => {
      checkPermission();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkInstallPermission, onComplete]);

  const handleConfigure = async () => {
    const granted = await requestInstallPermission();
    setVisible(false);

    if (onComplete) {
      onComplete(granted);
    }
  };

  const handleSkip = () => {
    setVisible(false);
    if (onComplete) {
      onComplete(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-outline" size={48} color="#007AFF" />
          </View>

          <Text style={styles.title}>Permissão de Instalação</Text>

          <Text style={styles.description}>
            Para que você possa instalar futuras atualizações do aplicativo, é
            necessário permitir a instalação de apps de fontes desconhecidas.
          </Text>

          <View style={styles.noteContainer}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#666"
            />
            <Text style={styles.noteText}>
              Esta permissão é segura e necessária apenas para atualizações
              deste aplicativo.
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Pular</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.configureButton}
              onPress={handleConfigure}
            >
              <Text style={styles.configureButtonText}>Configurar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#3C3C43",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  noteText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: "row",
    width: "100%",
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7C7CC",
    borderRadius: 12,
    marginRight: 8,
  },
  skipButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  configureButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    marginLeft: 8,
  },
  configureButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});
