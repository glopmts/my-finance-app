import {
  ColorSchemeName,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  PaymentSource,
  PAYMENTSOURCE_TRANSLATIONS,
} from "../../types/transaction-props";

const getPaymentSourceColor = (source: PaymentSource): string => {
  const colors: Record<PaymentSource, string> = {
    SALARY: "#27AE60",
    CREDIT_CARD: "#E74C3C",
    CASH: "#F39C12",
    PIX: "#3498DB",
    DEBIT_CARD: "#9B59B6",
    INVESTMENT: "#2C3E50",
  };
  return colors[source];
};

interface PaymentSourceSelectorProps {
  selectedSource: PaymentSource | null;
  onSourceChange: (source: PaymentSource) => void;
  colorScheme?: ColorSchemeName;
}

const PaymentSourceSelector: React.FC<PaymentSourceSelectorProps> = ({
  selectedSource,
  colorScheme,
  onSourceChange,
}) => {
  const isDark = colorScheme === "dark";

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDark ? "#18181b" : "#ffffff" }]}>
        Fonte de Pagamento:
      </Text>
      <View style={styles.sourcesContainer}>
        {Object.entries(PAYMENTSOURCE_TRANSLATIONS).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.sourceButton,
              selectedSource === key && {
                backgroundColor: getPaymentSourceColor(key as PaymentSource),
                borderColor: getPaymentSourceColor(key as PaymentSource),
              },
            ]}
            onPress={() => onSourceChange(key as PaymentSource)}
          >
            <Text
              style={[
                styles.sourceButtonText,
                selectedSource === key && styles.sourceButtonTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  sourcesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sourceButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
    minWidth: 100,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  sourceButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  sourceButtonTextActive: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default PaymentSourceSelector;
