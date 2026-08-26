import { useState, useCallback, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ListRenderItemInfo, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OrderStatus } from "../types/types";
import type { Order } from "../types/types";
import { useOrderList, addOrder } from "../hooks/useOrderList";
import { OrderCard } from "../components/OrderCard";
import { OrderFilterTabs } from "../components/OrderFilterTabs";
import { OrderStatsBar } from "../components/OrderStatsBar";
import { CreateOrderModal, CreateOrderValues } from "../components/CreateOrderModal";
import { OrderCardSkeleton } from "../../customers/components/CustomerCardSkeleton";
import { useDebounce } from "@/hooks/useDebounce";

type OrderListScreenProps = {
  onSelectOrder: (orderId: string) => void;
};

const ITEM_HEIGHT = 72;

export function OrderListScreen({ onSelectOrder }: OrderListScreenProps) {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { orders, counts, isLoading, isFetchingMore, hasMore, loadMore, refresh, stale } = useOrderList(activeFilter);

  useEffect(() => {
    const timer = setTimeout(() => setShowOverlay(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const filteredOrders = debouncedSearch
    ? orders.filter(
        (o) =>
          o.code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          o.customer.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : orders;

  const handleCreateOrder = (values: CreateOrderValues) => {
    addOrder(values);
    setCreateModalVisible(false);
  };

  const handleEndReached = useCallback(() => {
    if (hasMore && !isFetchingMore) loadMore();
  }, [hasMore, isFetchingMore, loadMore]);

  const getItemLayout = useCallback((_data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  const renderRow = useCallback(({ item }: ListRenderItemInfo<Order>) => (
    <OrderCard order={item} onPress={() => onSelectOrder(item.id)} />
  ), [onSelectOrder]);

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
      <OrderStatsBar
        totalOrders={counts.all ?? 0}
        totalShipping={counts[OrderStatus.Shipping] ?? 0}
        totalConfirmed={counts[OrderStatus.Confirmed] ?? 0}
        totalCancelled={counts[OrderStatus.Cancelled] ?? 0}
      />

      <View className="px-5 pt-3 pb-2 bg-gray-50">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 h-11">
          <Ionicons name="search-outline" size={24} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ស្វែងរកលេខ ORD ឬឈ្មោះអតិថិជន..."
            placeholderTextColor="#9CA3AF"
            className="font-khmer flex-1 ml-2 text-lg text-gray-800"
            style={{ outlineWidth: 0, borderWidth: 0, backgroundColor: "transparent", paddingVertical: 0, includeFontPadding: false, textAlignVertical: "center" }}
          />
          {stale && (
            <TouchableOpacity onPress={handleRefresh}>
              <Ionicons name="refresh-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <OrderFilterTabs active={activeFilter} onChange={setActiveFilter} counts={counts} />

      <View className="flex-1" style={{ minHeight: 0 }}>
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          getItemLayout={getItemLayout}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.15}
          renderItem={renderRow}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#2563EB"]}
              tintColor="#2563EB"
            />
          }
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            isLoading ? (
              <View className="flex-1 px-5 pt-2">
                {Array.from({ length: 8 }).map((_, i) => <OrderCardSkeleton key={`ol-${i}`} />)}
              </View>
            ) : (
              <View className="items-center justify-center py-16">
                <Ionicons name="receipt-outline" size={36} color="#D1D5DB" />
                <Text className="font-khmer text-gray-400 text-xl mt-2">មិនមានការបញ្ជាទិញទេ</Text>
              </View>
            )
          }
        />

        <TouchableOpacity
          onPress={() => setCreateModalVisible(true)}
          className="absolute bottom-5 right-5 w-14 h-14 rounded-full bg-blue-600 items-center justify-center"
          style={{ shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <CreateOrderModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateOrder}
      />

      {showOverlay && (
        <View
          className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center bg-gray-50"
          style={{ zIndex: 50 }}
        >
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="font-khmer text-gray-500 text-sm mt-3">កំពុងផ្ទុក...</Text>
        </View>
      )}
    </View>
  );
}