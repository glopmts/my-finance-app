import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

const OfflineScreen = () => {
  const themer = useTheme();
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Feather
          name="wifi-off"
          size={80}
          color={themer.isDark ? "#ffff" : "#666"}
        />

        <Text style={styles.title}>Sem conexão com a internet</Text>

        <Text style={styles.message}>
          Verifique sua conexão de rede e tente novamente
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    padding: 20,
    maxWidth: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default OfflineScreen;
