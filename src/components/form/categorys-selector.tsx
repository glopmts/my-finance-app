import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CATEGORY_TO_KEY } from "../../types/category_config";
import { CategoryEnum } from "../../types/transaction-props";

const getTypeColor = (category: CategoryEnum): string => {
  const colors: Record<CategoryEnum, string> = {
    TRANSPORTATION: "#FF6B6B",
    FOOD: "#4ECDC4",
    ACCOMMODATION: "#45B7D1",
    ENTERTAINMENT: "#96CEB4",
    HEALTHCARE: "#FFEAA7",
    EDUCATION: "#DDA0DD",
    UTILITIES: "#98D8C8",
    INVESTMENTS: "#F7DC6F",
    SHOPPING: "#BB8FCE",
    OTHER: "#85C1E9",
  };
  return colors[category];
};

interface CategorySelectorProps {
  selectedCategory: CategoryEnum | null;
  onCategoryChange: (category: CategoryEnum) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <View style={styles.typeContainer}>
      {Object.entries(CATEGORY_TO_KEY).map(([key, label]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.typeButton,
            selectedCategory === key && {
              backgroundColor: getTypeColor(key as CategoryEnum),
            },
          ]}
          onPress={() => onCategoryChange(key as CategoryEnum)}
        >
          <Text
            style={[
              styles.typeButtonText,
              selectedCategory === key && styles.typeButtonTextActive,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#F5F5F5",
  },
  typeButtonText: {
    fontSize: 14,
    color: "#666",
  },
  typeButtonTextActive: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default CategorySelector;
