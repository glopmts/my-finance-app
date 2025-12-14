import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LogLevel } from "./LogItem";

type LogFilterProps = {
  selectedLevel: LogLevel | "all";
  onSelectLevel: (level: LogLevel | "all") => void;
};

export const LogFilter: React.FC<LogFilterProps> = ({
  selectedLevel,
  onSelectLevel,
}) => {
  const theme = useTheme();

  const filters: { level: LogLevel | "all"; label: string; color: string }[] = [
    { level: "all", label: "Todos", color: theme.theme.primary },
    { level: "info", label: "Info", color: theme.theme.info },
    { level: "warn", label: "Warning", color: theme.theme.warning },
    { level: "error", label: "Error", color: theme.theme.error },
    { level: "debug", label: "Debug", color: theme.theme.textSecondary },
  ];

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.theme.backgroundSecondary,
    },
    scrollView: {
      paddingRight: 10,
    },
    filterRow: {
      flexDirection: "row",
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 10,
      borderWidth: 1,
    },
    filterText: {
      fontSize: 14,
      fontWeight: "500",
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.filterRow}>
          {filters.map((filter) => {
            const isSelected = selectedLevel === filter.level;
            return (
              <TouchableOpacity
                key={filter.level}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: isSelected ? filter.color : "transparent",
                    borderColor: filter.color,
                  },
                ]}
                onPress={() => onSelectLevel(filter.level)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isSelected
                        ? theme.isDark
                          ? "#000"
                          : "#fff"
                        : filter.color,
                    },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
