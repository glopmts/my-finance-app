import React from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextStyle,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

interface ProgressProps {
  /** Valor atual (0 a 100) */
  value: number;
  /** Valor máximo (padrão: 100) */
  maxValue?: number;
  /** Cor da barra de progresso */
  color?: string;
  /** Cor do fundo da barra */
  backgroundColor?: string;
  /** Altura da barra */
  height?: number;
  /** Bordas arredondadas */
  borderRadius?: number;
  /** Mostrar texto com porcentagem */
  showLabel?: boolean;
  /** Posição do texto: 'inside', 'outside', 'none' */
  labelPosition?: "inside" | "outside" | "none";
  /** Estilo customizado para o container */
  containerStyle?: ViewStyle;
  /** Estilo customizado para o texto */
  labelStyle?: TextStyle;
  /** Duração da animação em ms */
  animationDuration?: number;
  /** Mostrar animação */
  animated?: boolean;
  /** Formato do texto (padrão: 'percentage') */
  labelFormat?: "percentage" | "fraction" | "value";
  /** Prefixo do texto */
  prefix?: string;
  /** Sufixo do texto */
  suffix?: string;
  /** Largura total do componente */
  width?: number | string;
}

const Progress: React.FC<ProgressProps> = ({
  value = 0,
  maxValue = 100,
  color = "#4CAF50",
  backgroundColor = "#E0E0E0",
  height = 12,
  borderRadius = 6,
  showLabel = true,
  labelPosition = "outside",
  containerStyle,
  labelStyle,
  animationDuration = 500,
  animated = true,
  labelFormat = "percentage",
  prefix = "",
  suffix = "",
  width = "100%",
}) => {
  const [animatedWidth] = React.useState(new Animated.Value(0));
  const [displayValue, setDisplayValue] = React.useState(0);
  const deviceColorScheme = useColorScheme();

  const percentage = React.useMemo(() => {
    const clampedValue = Math.max(0, Math.min(value, maxValue));
    return (clampedValue / maxValue) * 100;
  }, [value, maxValue]);

  const formatLabel = React.useCallback(() => {
    switch (labelFormat) {
      case "percentage":
        return `${prefix}${Math.round(percentage)}%${suffix}`;
      case "fraction":
        return `${prefix}${Math.round(value)}/${maxValue}${suffix}`;
      case "value":
        return `${prefix}${Math.round(value)}${suffix}`;
      default:
        return `${prefix}${Math.round(percentage)}%${suffix}`;
    }
  }, [labelFormat, percentage, value, maxValue, prefix, suffix]);

  // Animação do progresso
  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: percentage,
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(percentage);
    }

    const timer = setTimeout(() => {
      setDisplayValue(Math.round(percentage));
    }, animationDuration);

    return () => clearTimeout(timer);
  }, [percentage, animated, animationDuration, animatedWidth]);

  const progressBarStyle = {
    width: animated
      ? animatedWidth.interpolate({
          inputRange: [0, 100],
          outputRange: ["0%", "100%"],
        })
      : (`${percentage}%` as `${number}%`),
    backgroundColor: color,
    height,
    borderRadius,
  };

  const getValidWidth = (w: number | string): number | `${number}%` => {
    if (typeof w === "number") return w;
    if (typeof w === "string" && w.trim().endsWith("%"))
      return w as `${number}%`;
    return "100%";
  };

  const containerStyles = {
    width: getValidWidth(width),
  };

  const renderLabel = () => {
    if (!showLabel || labelPosition === "none") return null;

    const label = (
      <Text
        style={[
          styles.label,
          labelStyle,
          labelPosition === "inside" && styles.insideLabel,
          { color: deviceColorScheme === "dark" ? "#fffc" : "#27272a" },
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {formatLabel()}
      </Text>
    );

    if (labelPosition === "inside") {
      return <View style={styles.insideLabelContainer}>{label}</View>;
    }

    return label;
  };

  return (
    <View style={[styles.container, containerStyle, containerStyles]}>
      {labelPosition === "outside" && (
        <View style={styles.labelRow}>
          {renderLabel()}
          {labelFormat === "percentage" &&
            showLabel &&
            labelPosition === "outside" && (
              <Text
                style={[
                  styles.label,
                  labelStyle,
                  { color: deviceColorScheme === "dark" ? "#fffc" : "#27272a" },
                ]}
              >
                {displayValue}%
              </Text>
            )}
        </View>
      )}

      <View
        style={[
          styles.progressBackground,
          { backgroundColor, height, borderRadius },
        ]}
      >
        <Animated.View style={[styles.progressBar, progressBarStyle]}>
          {labelPosition === "inside" && renderLabel()}
        </Animated.View>
      </View>

      {labelPosition === "outside" && labelFormat !== "percentage" && (
        <View style={styles.labelRow}>{renderLabel()}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  progressBackground: {
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  insideLabelContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  insideLabel: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 10,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default Progress;
