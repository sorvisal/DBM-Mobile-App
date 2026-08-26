import { useState, useCallback, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ListRenderItemInfo, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCustomerList, addCustomer } from "../hooks/useCustomerList";
import { CustomerCard } from "../components/CustomerCard";
import { CustomerCardSkeleton } from "../components/CustomerCardSkeleton";
import { CustomerStatsRow } from "../components/CustomerStatsRow";
import { CreateCustomerModal, CreateCustomerValues } from "../components/CreateCustomerModal";
import { CustomerStatus } from "../types/customer.types";
import { useDebounce } from "@/hooks/useDebounce";

type CustomerListScreenProps = {
  onSelectCustomer: (customerId: string) => void;
};

const ITEM_HEIGHT = 84;

export function CustomerListScreen({ onSelectCustomer }: CustomerListScreenProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { allCustomers, stats, isLoading, isFetchingMore, hasMore, loadMore, stale, refresh } = useCustomerList();

  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowOverlay(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Pull-to-refresh handler that triggers the API refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh(); // Fetches fresh data from the API
    } catch (err) {
      console.error("Failed to refresh customers:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredCustomers = debouncedSearch
    ? allCustomers.filter(
        (c: typeof allCustomers[0]) =>
          c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          c.code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          c.phone.includes(debouncedSearch)
      )
    : allCustomers;

  const handleCreateCustomer = async (values: CreateCustomerValues) => {
    setIsCreating(true);
    try {
      await addCustomer({
        name: values.name,
        phone: values.phone || undefined,
        address: values.address || undefined,
        status: values.status === CustomerStatus.Active ? "active" : "inactive",
        description: values.description || undefined,
      });
      setCreateModalVisible(false);
      refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "បរាជ័យក្នុងការបង្កើតអតិថិជន";
      Alert.alert("បញ្ហា", message);
    } finally {
      setIsCreating(false);
    }
  };

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

  const renderRow = useCallback(({ item }: ListRenderItemInfo<typeof filteredCustomers[0]>) => (
    <CustomerCard customer={item} onPress={() => onSelectCustomer(item.id)} />
  ), [onSelectCustomer]);

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
      <CustomerStatsRow
        totalCustomers={stats.totalCustomers}
        activeCustomers={stats.activeCustomers}
        totalOrders={stats.totalOrders}
        totalSpent={stats.totalSpent}
      />

      <View className="px-5 pt-6 pb-6 bg-gray-50">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 h-11">
          <Ionicons name="search-outline" size={22} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ស្វែងរកឈ្មោះ ឬលេខទូរស័ព្ទ..."
            placeholderTextColor="#9CA3AF"
            className="font-khmer flex-1 ml-2 text-lg text-gray-800"
            style={{ outlineWidth: 0, borderWidth: 0, backgroundColor: "transparent", paddingVertical: 0, includeFontPadding: false, textAlignVertical: "center" }}
          />
          {stale && (
            <TouchableOpacity onPress={handleRefresh} className="ml-1">
              <Ionicons name="refresh-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="flex-1" style={{ minHeight: 0 }}>
        <FlatList
          data={filteredCustomers}
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
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={renderRow}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            isLoading ? (
              <View className="flex-1 px-5 pt-2">
                {Array.from({ length: 8 }).map((_, i) => <CustomerCardSkeleton key={`cl-${i}`} />)}
              </View>
            ) : (
              <View className="items-center justify-center py-16">
                <Ionicons name="people-outline" size={36} color="#D1D5DB" />
                <Text className="font-khmer text-gray-400 text-xl mt-2">មិនមានអតិថិជនទេ</Text>
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

      <CreateCustomerModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateCustomer}
        isLoading={isCreating}
      />

      {showOverlay && (
        <View
          className="absolute inset-0 items-center justify-center bg-gray-50"
          style={{ zIndex: 50 }}
          pointerEvents="none"
        >
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="font-khmer text-gray-400 text-sm mt-3">កំពុងផ្ទុក...</Text>
        </View>
      )}
    </View>
  );
}