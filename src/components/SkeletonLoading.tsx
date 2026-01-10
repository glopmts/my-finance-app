import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

const SkeletonItem: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const shimmerValue = useSharedValue(0);

  React.useEffect(() => {
    shimmerValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        shimmerValue.value,
        [0, 0.5, 1],
        ["#27272a", "#3f3f46", "#27272a"]
      ),
    };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          paddingTop: 8,
          marginBottom: 8,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

// Componente para a primeira tela (InforCarSalary)
export const SalarySkeleton: React.FC = () => {
  return (
    <View className="w-full p-2" style={styles.container}>
      {/* Header */}
      <View className="mb-6 flex-row justify-between items-center">
        <SkeletonItem width={200} height={30} borderRadius={8} />
        <SkeletonItem width={120} height={40} borderRadius={20} />
      </View>

      {/* Salary Card */}
      <View className="mb-6 p-4 rounded-xl dark:bg-zinc-800/50 bg-gray-200/50">
        <View className="mb-4 flex-row justify-between">
          <SkeletonItem width={150} height={24} />
          <SkeletonItem width={100} height={24} />
        </View>

        {/* Progress Bar */}
        <View className="mb-4">
          <SkeletonItem width="100%" height={12} borderRadius={6} />
          <View className="mt-2 flex-row justify-between">
            <SkeletonItem width={80} height={16} />
            <SkeletonItem width={80} height={16} />
          </View>
        </View>

        {/* Info items */}
        <View className="space-y-3">
          <SkeletonItem width="100%" height={20} />
          <SkeletonItem width="90%" height={20} />
          <SkeletonItem width="80%" height={20} />
        </View>
      </View>

      {/* Manage Finances Section */}
      <View className="mt-6">
        <SkeletonItem width={200} height={30} borderRadius={8} />

        <View className="p-4 rounded-xl dark:bg-zinc-800/50 bg-gray-200/50">
          <View className="mb-4">
            <SkeletonItem width="100%" height={12} borderRadius={6} />
            <View className="mt-2 flex-row justify-between">
              <SkeletonItem width={60} height={16} />
              <SkeletonItem width={60} height={16} />
              <SkeletonItem width={60} height={16} />
            </View>
          </View>

          <View className="flex-row justify-between">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="items-center">
                <SkeletonItem width={40} height={40} borderRadius={20} />
                <SkeletonItem width={50} height={16} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

// Componente para a segunda tela (LastestTransactionsPage)
export const TransactionsSkeleton: React.FC = () => {
  return (
    <View className="w-full p-4" style={styles.container}>
      {/* Header */}
      <View className="mb-6 flex-row justify-between items-center">
        <View>
          <SkeletonItem width={180} height={30} borderRadius={8} />
          <SkeletonItem width={120} height={16} />
        </View>
        <SkeletonItem width={30} height={30} borderRadius={15} />
      </View>

      {/* Transaction List */}
      <View
        className="space-y-4"
        style={{
          gap: 8,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            className="p-4 rounded-xl dark:bg-zinc-800/50 bg-gray-200/50"
          >
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <SkeletonItem width={40} height={40} borderRadius={20} />
                <View className="ml-3">
                  <SkeletonItem width={120} height={18} />
                  <SkeletonItem width={80} height={14} />
                </View>
              </View>
              <SkeletonItem width={60} height={20} />
            </View>

            <View className="flex-row justify-between">
              <SkeletonItem width={100} height={16} />
              <SkeletonItem width={80} height={16} />
            </View>
          </View>
        ))}
      </View>

      {/* Ver tudo button */}
      <View className="mt-6 items-center">
        <SkeletonItem width={120} height={40} borderRadius={20} />
      </View>
    </View>
  );
};

// Skeleton simples para usar em qualquer lugar
export const SimpleSkeleton: React.FC<{
  count?: number;
  variant?: "card" | "list" | "text";
}> = ({ count = 1, variant = "text" }) => {
  if (variant === "card") {
    return (
      <View className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <View
            key={i}
            className="p-4 rounded-xl dark:bg-zinc-800/50 bg-gray-200/50"
          >
            <SkeletonItem width="100%" height={20} />
            <SkeletonItem width="80%" height={16} />
            <SkeletonItem width="60%" height={16} />
          </View>
        ))}
      </View>
    );
  }

  if (variant === "list") {
    return (
      <View className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} className="flex-row items-center">
            <SkeletonItem width={40} height={40} borderRadius={20} />
            <View className="flex-1">
              <SkeletonItem width={`${70 + (i % 3) * 10}%`} height={18} />
              <SkeletonItem width={`${40 + (i % 3) * 10}%`} height={14} />
            </View>
            <SkeletonItem width={50} height={18} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem
          key={i}
          width={`${80 + (i % 4) * 5}%`}
          height={16}
          borderRadius={4}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  SkeletonItem1: {
    paddingTop: 8,
  },
});

export default SkeletonItem;
