import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CATEGORY_CONFIG } from "../../types/category_config";
import { CategoryEnum } from "../../types/transaction-props";

interface CategoryIconProps {
  category: CategoryEnum;
  size?: number;
  showBackground?: boolean;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 40,
  showBackground = true,
}) => {
  const config = CATEGORY_CONFIG[category];

  if (!config) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Text style={[styles.icon, { fontSize: size * 0.5 }]}>❓</Text>
      </View>
    );
  }

  if (showBackground) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            backgroundColor: config.color,
            borderRadius: size * 0.25,
          },
        ]}
      >
        <Text style={[styles.icon, { fontSize: size * 0.5 }]}>
          {config.icon}
        </Text>
      </View>
    );
  }

  return (
    <Text style={[styles.icon, { fontSize: size * 0.5 }]}>{config.icon}</Text>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    textAlign: "center",
  },
});

export default CategoryIcon;
