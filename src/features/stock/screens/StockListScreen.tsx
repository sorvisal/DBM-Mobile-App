import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, ListRenderItemInfo, NativeSyntheticEvent, NativeScrollEvent, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StockTabBar } from "../components/StockTabBar";
import { TotalProductCard } from "../components/totalProdcutCard";
import { ProductCardSkeleton } from "../../customers/components/CustomerCardSkeleton";
import type { StockTabKey } from "./StockScreen";
import { useStockList } from "../hooks/useStockList";
import { useDebounce } from "@/hooks/useDebounce";

type StockListScreenProps = {
  onNavigate: (tab: StockTabKey) => void;
};

const ITEM_HEIGHT = 76;

export function StockListScreen({ onNavigate }: StockListScreenProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isFetchingMore, hasMore, loadMore, error, stale } = useStockList(debouncedSearch);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isFetchingMore) loadMore();
  }, [hasMore, isFetchingMore, loadMore]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 200) {
      handleEndReached();
    }
  }, [handleEndReached]);

  const getItemLayout = useCallback((_data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  const renderRow = useCallback(({ item }: ListRenderItemInfo<typeof data[0]>) => (
    <TotalProductCard
      key={item.id}
      imageUrl={item.imageUrl ?? ""}
      name={item.name}
      unit={item.category}
      buyPrice={`${item.buyPrice}$`}
      sellPrice={`${item.sellPrice}$`}
      quantity={item.quantity}
      isLowStock={item.status !== "in_stock"}
      onPress={() => {}}
    />
  ), []);

  const renderFooter = useCallback(() => {
    if (!isFetchingMore) return null;
    return (
      <View className="items-center py-4">
        <Ionicons name="hourglass-outline" size={20} color="#9CA3AF" className="animate-spin" />
        <Text className="font-khmer text-gray-400 text-sm mt-1">កំពុងផ្ទុកបន្ថែម...</Text>
      </View>
    );
  }, [isFetchingMore]);

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      <StockTabBar active="products" onChange={onNavigate} />

      <View className="px-5 pt-3 pb-2 bg-gray-50">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 h-11">
          <Ionicons name="search-outline" size={24} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ស្វែងរកទំនិញ..."
            placeholderTextColor="#9CA3AF"
            className="font-khmer flex-1 ml-2 text-lg text-gray-800"
            style={{ outlineWidth: 0, borderWidth: 0, backgroundColor: "transparent", paddingVertical: 0, includeFontPadding: false, textAlignVertical: "center" }}
          />
          {stale && (
            <TouchableOpacity>
              <Ionicons name="refresh-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.15}
        renderItem={renderRow}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 px-5 pt-2">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={`sl-${i}`} />)}
            </View>
          ) : error ? (
            <View className="items-center py-16">
              <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
              <Text className="font-khmer text-red-400 text-xl mt-2">{error}</Text>
            </View>
          ) : (
            <View className="items-center py-16">
              <Ionicons name="cube-outline" size={36} color="#D1D5DB" />
              <Text className="font-khmer text-gray-400 text-xl mt-2">មិនមានផលិតផល</Text>
            </View>
          )
        }
      />
    </View>
  );
}
