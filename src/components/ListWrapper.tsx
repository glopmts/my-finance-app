import { useColorScheme } from "nativewind";
import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import EmptyState from "./EmptyState";

interface ListWrapperProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  onRefresh?: () => void;
  emptyTitle: string;
  emptyMessage?: string;
  emptyActionText?: string;
  onEmptyActionPress?: () => void;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
}

const ListWrapper = <T,>({
  data,
  renderItem,
  keyExtractor,
  loading = false,
  onRefresh,
  emptyTitle,
  emptyMessage,
  emptyActionText,
  onEmptyActionPress,
  ListHeaderComponent,
  ListFooterComponent,
}: ListWrapperProps<T>) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (data.length === 0) {
    return (
      <EmptyState
        icon="receipt-outline"
        title={emptyTitle}
        message={emptyMessage}
        actionText={emptyActionText}
        onActionPress={onEmptyActionPress}
      />
    );
  }

  return (
    <FlatList
      style={{ flex: 1 }}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => renderItem(item, index)}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[isDark ? "#3b82f6" : "#2563eb"]}
            tintColor={isDark ? "#3b82f6" : "#2563eb"}
          />
        ) : undefined
      }
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={{
        padding: 1,
        flexGrow: 1,
        paddingBottom: 20,
      }}
      ItemSeparatorComponent={() => <View className="h-3" />}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      alwaysBounceVertical={true}
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      windowSize={10}
    />
  );
};

export default ListWrapper;
